import os
import logging

from globus_sdk import ConfidentialAppAuthClient
from globus_sdk import TransferClient, TransferData
from globus_sdk import RefreshTokenAuthorizer

from ..utils.mcexceptions import DatabaseError, AuthenticationException, NoSuchItem, AccessNotAllowedException
from ..database.DB import DbConnection
from .GlobusAccess import GlobusAccess, CONFIDENTIAL_CLIENT_APP_AUTH
from ..database.DatabaseInterface import DatabaseInterface
from .access_exceptions import AuthenticationException, RequiredAttributeException


class MaterialsCommonsGlobusInterface:
    def __init__(self, mc_user_id):
        self.log = logging.getLogger(__name__ + "." + self.__class__.__name__)
        self.log.debug("MaterialsCommonsGlobusInterface init - started")
        self.version = "0.1"
        self.mc_user_id = mc_user_id

        self.client_user = os.environ.get('MC_CONFIDENTIAL_CLIENT_USER')
        self.client_token = os.environ.get('MC_CONFIDENTIAL_CLIENT_PW')
        self.mc_cc_endpoint = os.environ.get('MC_CONFIDENTIAL_CLIENT_ENDPOINT')
        self.globus_access = GlobusAccess(use_implementation=CONFIDENTIAL_CLIENT_APP_AUTH)

        self.cc_transfer_client = None
        self.user_transfer_client = None
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

        self.log.debug("MaterialsCommonsGlobusInterface init - done")

    def setup_transfer_clients(self):
        self.cc_transfer_client = self.get_cc_transfer_client()
        self.user_transfer_client = self.get_user_transfer_client()

    def get_cc_transfer_client(self):
        if self.cc_transfer_client:
            return self.cc_transfer_client
        self.cc_transfer_client = self.globus_access.get_cc_transfer_client()

    def get_user_transfer_client(self):
        if self.user_transfer_client:
            return self.user_transfer_client
        self.log.info("Getting MC User's globus infomation")
        records = DatabaseInterface().get_globus_auth_info_records_by_user_id(self.mc_user_id)
        # Only the latest
        record = (records[0] if len(records) > 0 else None)
        if not record:
            message = "Globus auth info record for MC user {} does not exist; logged out?".format(self.mc_user_id)
            self.log.error(message)
            raise AuthenticationException(message)

        # else
        self.log.info("Got MC User's globus information; getting tokens")
        self.source_user_globus_id = record['globus_id']
        transfer_tokens = record['tokens']['transfer.api.globus.org']
        self.log.info("Got transfer.api.globus.org tokens; keys = {}".format(transfer_tokens.keys()))
        transfer_client = \
            self._get_transfer_client_from_tokens(transfer_tokens)
        if not transfer_client:
            message = "User's Transfer Client is not available: {}".format(self.source_user_globus_id)
            self.log.error(message)
            raise RequiredAttributeException(message)
        return transfer_client

    def _get_transfer_client_from_tokens(self, transfer_tokens):
        authorizer = RefreshTokenAuthorizer(
            transfer_tokens['refresh_token'],
            self.globus_access.get_auth_client(),
            access_token=transfer_tokens['access_token'],
            expires_at=transfer_tokens['expires_at_seconds'])

        transfer = TransferClient(authorizer=authorizer)

        return transfer

    def set_user_access_rule(self, mc_target_endpoint_path):
        self.cc_transfer_client.endpoint_autoactivate(self.mc_cc_endpoint)
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

    def transfer(self, source_endpoint, source_path, destination_endpoint, destination_path,
                 label='to specified project'):
        transfer_label = 'MaterialsCommons {}'.format(label)
        self.log.info("Setting up transfer for:")
        self.log.info("  source_endpoint = {}".format(source_endpoint))
        self.log.info("  source_path = {}".format(source_path))
        self.log.info("  destination_endpoint = {}".format(destination_endpoint))
        self.log.info("  destination_path = {}".format(destination_path))
        self.log.info("  lable = {}".format(transfer_label))
        transfer_data = TransferData(transfer_client=self.user_transfer_client,
                                     source_endpoint=source_endpoint,
                                     destination_endpoint=destination_endpoint,
                                     label=transfer_label)
        self.log.info("Object transfer_data = {}".format(transfer_data))
        transfer_data.add_item(source_path=source_path,
                               destination_path=destination_path,
                               recursive=True)
        self.log.info("Object transfer_data = {}".format(transfer_data))

        self.log.info("Before submit transfer")
        results = self.user_transfer_client.submit_transfer(transfer_data)
        self.log.info("After submit transfer: {}".format(results))
        task_id = results['task_id']
        return task_id

    def get_task_status(self, task_id):
        if not self.user_transfer_client:
            error = "Missing authenticated transfer client"
            self.log.error("Error: " + str(error))
            raise AuthenticationException(error)

        transfer = self.user_transfer_client

        error = None
        for event in transfer.task_event_list(task_id):
            if event["is_error"]:
                error = event

        if error:
            self.log.error("Globus transfer error: " + error['description'] + " - " + self.mc_user_id)
            self.log.error("   -- code " + error['code'])
            self.log.error("   -- message " + error['details'])
            error = {"error": error['code'], "message": error['details']}
        transfer_result = transfer.get_task(task_id)

        return_result = {}
        if error:
            return_result = error
        keys = ["status", "nice_status_details", "files", "files_skipped"]
        for key in keys:
            return_result[key] = transfer_result[key]
        return return_result

    def get_auth_client(self):
        auth_client = ConfidentialAppAuthClient(
            client_id=self.client_user, client_secret=self.client_token)
        return auth_client

    @staticmethod
    def insert_entry_id(table_name, entry):
        conn = DbConnection().connection()
        r = DbConnection().interface()
        rr = r.table(table_name).insert(entry, return_changes=True)
        rv = rr.run(conn)
        if rv['inserted'] == 1:
            if 'generated_keys' in rv:
                return rv['generated_keys'][0]
            else:
                return rv['new_val']['id']
        raise DatabaseError()
