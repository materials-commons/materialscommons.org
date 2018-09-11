import logging
import os
import sys

from globus_sdk import (ConfidentialAppAuthClient, ClientCredentialsAuthorizer, TransferClient)

SUPPRESS_GLOBUS_LOGGING = True
ONE_TIME_SHARE_NAME = "Materials Commons GCS One Time Share for testing"
ONE_TIME_SHARE_PATH = "/mcdir/experimenting_with_share/"


class AuthenticationException(BaseException):
    def __init__(self, attr):
        self.attr = str(attr)


class GlobusHelper:
    def __init__(self):
        self.log = logging.getLogger(self.__class__.__name__)
        self.log.info("in __init__")
        self.client_user = None
        self.client_token = None
        self.auth_client = None
        self.transfer_client = None

    def setup(self):
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
        # self.log.info("  -- MC_CONFIDENTIAL_CLIENT_PW = {}".format(self.client_token))

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
        self.auth_client = auth_client
        self.transfer_client = transfer_client

    def get_globus_user(self, user_name):
        ret = self.auth_client.get_identities(usernames=[user_name])
        user = None
        if ret and ret['identities'] and len(ret['identities']) > 0:
            user = ret['identities'][0]
        return user

    def get_endpoint(self, ep_id):
        return self.transfer_client.get_endpoint(ep_id)

    def my_shared_endpoint_list(self, ep_id):
        return self.transfer_client.my_shared_endpoint_list(ep_id)

    def endpoint_autoactivate(self, ep):
        return self.transfer_client.endpoint_autoactivate(ep)

    def endpoint_activate(self, ep):
        return self.transfer_client.endpoint_activate(ep)

    def create_shared_endpoint(self, base_ep, path, display_name):
        data = {
            "DATA_TYPE": "shared_endpoint",
            "host_endpoint": base_ep,
            "host_path": path,
            "display_name": display_name
        }
        return self.transfer_client.create_shared_endpoint(data)

    def set_acl_rule(self, ep_id, path, globus_user_id, permits):
        transfer_client = self.transfer_client
        results = transfer_client.endpoint_acl_list(ep_id)
        for rule in results["DATA"]:
            if rule['path'] == path and rule['principal'] == globus_user_id:
                return rule
        rule_data = {
            "DATA_TYPE": "access",
            "principal_type": "identity",
            "principal": globus_user_id,
            "path": path,
            "permissions": permits
        }
        results = transfer_client.add_endpoint_acl_rule(ep_id, rule_data)
        if not results['code'] == "Created":
            return None
        results = transfer_client.endpoint_acl_list(ep_id)
        for rule in results["DATA"]:
            if rule['path'] == path and rule['principal'] == globus_user_id:
                return rule
        return None


class OneTimeShare:
    def __init__(self, globus_access):
        self.log = logging.getLogger(self.__class__.__name__)
        self.globus_access = globus_access

    def make_it_so(self, base_endpoint):
        self.log.info("Setting or Fetching one-time share")
        ep_list = self.globus_access.my_shared_endpoint_list(base_endpoint)
        found = None
        for ep in ep_list:
            self.log.info(ep['display_name'])
            if ep['display_name'] == ONE_TIME_SHARE_NAME:
                self.log.info("Found shared endpoint: {} ({})".format(ep['display_name'], ep['id']))
                found = ep
        if found:
            return found['id']
        # else
        ep = self.globus_access.create_shared_endpoint(
            base_endpoint, ONE_TIME_SHARE_PATH, ONE_TIME_SHARE_NAME)
        self.log.info("Created shared endpoint: {} ({})".format(ep['display_name'], ep['id']))
        return ep['id']


class BasicACLExample:
    def __init__(self):
        self.log = logging.getLogger(self.__class__.__name__)
        self.log.info("BasicACLExample.__init__()")
        self.globus_access = GlobusHelper()
        self.globus_access.setup()

    def do_it(self, globus_user_name, base_endpoint, path):
        # ret =
        self.globus_access.endpoint_autoactivate(base_endpoint)
        # self.log.info("Value returned from autoactivte = {}".format(ret))
        target_endpoint = OneTimeShare(self.globus_access).make_it_so(base_endpoint)
        self.log.info("Transfer base endpoint id = {}".format(target_endpoint))
        ret = self.globus_access.get_globus_user(globus_user_name)
        globus_user_id = ret['id']
        self.log.info("Globus user = {} ({})".format(globus_user_name, globus_user_id))

        ep = self.globus_access.get_endpoint(target_endpoint)
        self.log.info("Endpoint 'acl_available' flag = {}".format(ep['acl_available']))

        results = self.globus_access.set_acl_rule(
            target_endpoint, path, globus_user_id, 'rw')
        self.log.info("Results from setting acl rule = {}".format(results))


if __name__ == '__main__':
    root = logging.getLogger()
    root.setLevel(logging.INFO)

    log_handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(name)s:%(lineno)d - %(message)s')
    log_handler.setFormatter(formatter)
    root.addHandler(log_handler)

    if SUPPRESS_GLOBUS_LOGGING:
        # suppress info logging for globus_sdk loggers that are invoked,
        # while leaving my logging level in place
        logger_list = ['globus_sdk.authorizers.basic', 'globus_sdk.authorizers.client_credentials',
                       'globus_sdk.authorizers.renewing', 'globus_sdk.transfer.client.TransferClient',
                       'globus_sdk.transfer.paging',
                       'globus_sdk.auth.client_types.confidential_client.ConfidentialAppAuthClient']
        for name in logger_list:
            logging.getLogger(name).setLevel(logging.ERROR)

    startup_log = logging.getLogger("main-setup")
    startup_log.info("Starting main-setup")

    # ---- These should be command line params ----
    # endpoint_id is the endpoint on which to set acl (a shared endpoint)
    endpoint_id = '014b867a-b5d1-11e8-8241-0a3b7ca8ce66'
    # endpoint_path
    endpoint_path = '/mcdir/landing_for_test/'
    # globus_user_id - the globus user that is in the ACL rule
    globus_user = "materialscommonstestuser1@globusid.org"
    # permissions for the ACL Rule ("r" "rw")
    permissions = "rw"

    BasicACLExample().do_it(globus_user, endpoint_id, endpoint_path)
