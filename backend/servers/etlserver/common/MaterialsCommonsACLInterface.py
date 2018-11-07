import os
import logging

from .GlobusAccess import GlobusAccess, CONFIDENTIAL_CLIENT_APP_AUTH
from ..database.DatabaseInterface import DatabaseInterface
from .access_exceptions import AuthenticationException, RequiredAttributeException


class MaterialsCommonsACLInterface:
    def __init__(self, mc_user_id):
        self.log = logging.getLogger(__name__ + "." + self.__class__.__name__)
        self.log.info("init - started")
        self.mc_user_id = mc_user_id

        self.client_user = os.environ.get('MC_CONFIDENTIAL_CLIENT_USER')
        self.client_token = os.environ.get('MC_CONFIDENTIAL_CLIENT_PW')
        self.mc_cc_endpoint = os.environ.get('MC_CONFIDENTIAL_CLIENT_ENDPOINT')
        self.globus_access = GlobusAccess(use_implementation=CONFIDENTIAL_CLIENT_APP_AUTH)

        self.cc_transfer_client = None
        self.source_user_globus_id = None

        if (not self.client_user) or (not self.client_token) or (not self.mc_cc_endpoint):
            missing = []
            if not self.client_user:
                missing.append('MC_CONFIDENTIAL_CLIENT_USER')
            if not self.client_token:
                missing.append('MC_CONFIDENTIAL_CLIENT_PW')
            if not self.mc_cc_endpoint:
                missing.append("MC_CONFIDENTIAL_CLIENT_ENDPOINT")
            message = "Missing environment values: {}".format(", ".join(missing))
            raise RequiredAttributeException(message)

        self.log.info("setup from environment variables:")
        self.log.info("  MC_CONFIDENTIAL_CLIENT_USER (self.client_user) = {}".format(self.client_user))
        self.log.info("  MC_CONFIDENTIAL_CLIENT_PW (self.client_token) = {}".format(self.client_token))
        self.log.info("  MC_CONFIDENTIAL_CLIENT_ENDPOINT (self.mc_cc_endpoint) = {}".format(self.mc_cc_endpoint))

        self.log.info("init - done")

    def set_user_globus_id(self):
        results = DatabaseInterface().get_users_globus_id(self.mc_user_id)
        globus_user_name = results['globus_user']
        self.log.info("User globus_user_name - {}".format(globus_user_name))
        results = self.globus_access.get_globus_user(globus_user_name)
        self.log.info("User information - {}".format(results))
        self.source_user_globus_id = results['id']
        self.log.info("Using globus user id: {}".format(self.source_user_globus_id))
        return self.source_user_globus_id

    def get_cc_transfer_client(self):
        if not self.cc_transfer_client:
            self.cc_transfer_client = self.globus_access.get_cc_transfer_client()
        return self.cc_transfer_client

    def set_user_access_rule(self, mc_target_endpoint_path):
        self.cc_transfer_client.endpoint_autoactivate(self.mc_cc_endpoint)
        self.log.info("Setting ACL for {} on {} at {}".format(
            self.source_user_globus_id, self.mc_cc_endpoint, mc_target_endpoint_path
        ))
        self.cc_transfer_client.add_endpoint_acl_rule(
            self.mc_cc_endpoint,
            dict(principal=self.source_user_globus_id,
                 principal_type='identity', path=mc_target_endpoint_path, permissions='rw')
        )

    def get_user_access_rule(self, mc_target_endpoint_path):
        self.cc_transfer_client.endpoint_autoactivate(self.mc_cc_endpoint)
        acl_list = self.cc_transfer_client.endpoint_acl_list(self.mc_cc_endpoint)
        acl = None
        for probe in acl_list:
            if mc_target_endpoint_path == probe['path'] and self.source_user_globus_id == probe['principal']:
                acl = probe
        self.log.info("ACL from search: {}".format(acl))
        return acl

    def clear_user_access_rule(self, mc_target_endpoint_path):
        acl = self.get_user_access_rule(mc_target_endpoint_path)
        if acl:
            self.cc_transfer_client.delete_endpoint_acl_rule(self.mc_cc_endpoint, acl['id'])
