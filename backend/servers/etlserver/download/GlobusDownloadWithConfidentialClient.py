import logging
import os
from random import randint

from globus_sdk import ConfidentialAppAuthClient, ClientCredentialsAuthorizer, TransferClient

from backend.servers.etlserver.download.download_exceptions \
    import RequiredAttributeException, AuthenticationException


class GlobusDownloadWithConfidentialClient:
    def __init__(self, file_list, user_name):
        self.log = logging.getLogger(self.__class__.__name__)
        self.log.info(" init - started")
        self.file_list = file_list
        self.transfer_client = None
        self.auth_client = None
        self.user_dir = None
        self.user_name = user_name

    def get_transfer_client(self):
        if self.transfer_client:
            return self.transfer_client

        client_user = os.environ.get('MC_CONFIDENTIAL_CLIENT_USER')
        client_token = os.environ.get('MC_CONFIDENTIAL_CLIENT_PW')
        auth_client = ConfidentialAppAuthClient(
            client_id=client_user, client_secret=client_token)
        self.auth_client = auth_client
        scopes = "urn:globus:auth:scope:transfer.api.globus.org:all"
        cc_authorizer = ClientCredentialsAuthorizer(auth_client, scopes)
        self.transfer_client = TransferClient(authorizer=cc_authorizer)
        return self.transfer_client

    def download(self):
        self.stage()
        self.expose()

    def stage(self):
        self.log.info("Staging - start")
        mc_dirs = os.environ.get('MCDIR')
        mc_dir = mc_dirs.split(':')[0]
        self.log.info("Staging - mc dir = {}".format(mc_dir))
        staging_dir = '/Users/weymouth/working/MaterialsCommons/mcdir/__download_staging'
        self.user_dir = self.make_random_name('testing-')
        staging_dir = os.path.join(staging_dir, self.user_dir)
        self.log.info("Staging - staging dir = {}".format(staging_dir))
        self.log.info("Staging - user dir = {}".format(self.user_dir))
        os.makedirs(staging_dir)
        for file in self.file_list:
            p1 = file.id[9:11]
            p2 = file.id[11:13]
            file_path = os.path.join(mc_dir, p1, p2, file.id)
            link_path = os.path.join(staging_dir, file.name)
            os.link(file_path, link_path)
        self.log.info("Staging - end")

    def expose(self):
        self.log.info("Expose - start")
        transfer_client = self.get_transfer_client()
        ret = self.auth_client.get_identities(usernames=self.user_name)
        globus_user = None
        if ret and ret['identities'] and len(ret['identities']) > 0:
            globus_user = ret['identities'][0]
        if not globus_user:
            raise RequiredAttributeException("Missing Globus user identity")
        self.log.info("Globus user = {}, id = {}".format(globus_user['name'], globus_user['id']))
        # materials_commons_ep_id = os.environ.get('MC_CONFIDENTIAL_CLIENT_ENDPOINT')
        download_ep_id = '84b62e46-5ebc-11e8-91d5-0a6d4e044368'
        confidential_client_endpoint = transfer_client.get_endpoint(download_ep_id)
        self.log.info("Expose - base ep = {}".format(confidential_client_endpoint['display_name']))
        for entry in transfer_client.operation_ls(download_ep_id, path=self.user_dir):
            self.log.info("  name = {}, type={}".format(entry['name'], entry['type']))
        acl_rule = {
            "DATA_TYPE": "access",
            "principal_type": "identity",
            "principal": globus_user['id'],
            "path": "/" + self.user_dir + "/",
            "permissions": "r"
        }
        results = transfer_client.add_endpoint_acl_rule(download_ep_id, acl_rule)
        if not (results and results['access_id']):
            raise AuthenticationException("Can not set access control rule for {} on {}".
                                          format(globus_user['name'], "/" + self.user_dir + "/"))
        self.log.info("Transfer enabled for {} ({})".format(globus_user['name'], globus_user['is']))
        self.log.info("    from ep: {} with directory {}".format(download_ep_id, self.user_dir))
        self.log.info("Expose - end")

    @staticmethod
    def make_random_name(prefix):
        number = "%05d" % randint(0, 99999)
        return prefix + number
