import logging
import os

from .access_exceptions import AuthenticationException

from globus_sdk import ConfidentialAppAuthClient, ClientCredentialsAuthorizer
from globus_sdk import TransferClient


class GlobusAccessWithConfidentialAuth:
    def __init__(self):
        self.log = logging.getLogger(self.__class__.__name__)
        self.log.debug(" init - started")

        self.client_user = os.environ.get('MC_CONFIDENTIAL_CLIENT_USER')
        self.client_token = os.environ.get('MC_CONFIDENTIAL_CLIENT_PW')

        if (not self.client_user) or (not self.client_token):
            missing = []
            if not self.client_user:
                missing.append('MC_CONFIDENTIAL_CLIENT_USER')
            if not self.client_token:
                missing.append('MC_CONFIDENTIAL_CLIENT_PW')
            message = "Missing environment values: {}".format(", ".join(missing))
            raise EnvironmentError(message)

        self.log.info("Env variables are ok")
        self.log.info("  -- MC_CONFIDENTIAL_CLIENT_USER = {}".format(self.client_user))

        auth_client = ConfidentialAppAuthClient(
            client_id=self.client_user, client_secret=self.client_token)
        if not auth_client:
            error = "No Authentication Client"
            self.log.error("Error: " + str(error))
            raise AuthenticationException(error)
        self.log.info("set_transfer_client - auth_client = {}".format(auth_client.client_id))
        scopes = "urn:globus:auth:scope:transfer.api.globus.org:all"
        cc_authorizer = ClientCredentialsAuthorizer(auth_client, scopes)
        transfer_client = TransferClient(authorizer=cc_authorizer)
        self.log.debug("get_transfer_interface - transfer_client")
        self.log.debug(transfer_client)
        if not transfer_client:
            error = "No transfer interface"
            self.log.error("Error: " + str(error))
            raise AuthenticationException(error)

        self.log.debug(" init - done")
        self._auth_client = auth_client
        self._transfer_client = transfer_client

    def get_globus_user(self, user_name):
        ret = self._auth_client.get_identities(usernames=[user_name])
        globus_user = None
        if ret and ret['identities'] and len(ret['identities']) > 0:
            globus_user = ret['identities'][0]
        return globus_user

    def get_globus_user_by_id(self, user_id):
        ret = self._auth_client.get_identities(ids=[user_id])
        globus_user = None
        if ret and ret['identities'] and len(ret['identities']) > 0:
            globus_user = ret['identities'][0]
        return globus_user

    def get_endpoint(self, endpoint_id):
        return self._transfer_client.get_endpoint(endpoint_id)

    def get_endpoint_id(self, endpoint_name):
        print("My Endpoints:")
        found = None
        for ep in self._transfer_client.endpoint_search(filter_scope="my-endpoints"):
            print(ep["display_name"])
            if ep["display_name"] == endpoint_name:
                found = ep
        if found:
            return found['id']
        return None

    def task_list(self, num_results=10):
        return self._transfer_client.task_list(num_results=num_results)

    def cancel_task(self, task_id):
        return self._transfer_client.cancel_task(task_id)

    # def set_acl_rule(self, ep_id, path, globus_user_id, permissions):
    #     results = self._transfer_client.endpoint_acl_list(ep_id)
    #     for rule in results["DATA"]:
    #         if rule['path'] == path and rule['principal'] == globus_user_id:
    #             return rule
    #     rule_data = {
    #         "DATA_TYPE": "access",
    #         "principal_type": "identity",
    #         "principal": globus_user_id,
    #         "path": path,
    #         "permissions": permissions
    #     }
    #     results = self._transfer_client.add_endpoint_acl_rule(ep_id, rule_data)
    #     if not results['code'] == "Created":
    #         return None
    #     results = self._transfer_client.endpoint_acl_list(ep_id)
    #     for rule in results["DATA"]:
    #         if rule['path'] == path and rule['principal'] == globus_user_id:
    #             return rule
    #     return None
