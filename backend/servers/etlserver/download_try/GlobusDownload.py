import logging
import os
from random import randint

from backend.servers.etlserver.download_try.GlobusAccessWithNativeAppAuth import GlobusAccess
from backend.servers.etlserver.download_try.download_exceptions import RequiredAttributeException


class GlobusDownload:
    def __init__(self, file_list, user_name):
        self.log = logging.getLogger(self.__class__.__name__)
        self.log.info(" init - started")
        self.file_list = file_list
        self.transfer_client = None
        self.user_dir = None
        self.user_name = user_name
        self.access = GlobusAccess()

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
        self.log.info("Looking up globus identity of {}".format(self.user_name))
        globus_user = self.access.get_globus_user(self.user_name)
        if not globus_user:
            raise RequiredAttributeException("Missing Globus user identity")
        self.log.info("Globus user = {}, id = {}".format(globus_user['name'], globus_user['id']))
        download_ep_id = '84b62e46-5ebc-11e8-91d5-0a6d4e044368'
        confidential_client_endpoint = self.access.get_endpoint(download_ep_id)
        self.log.info("Expose - base ep = {}".format(confidential_client_endpoint['display_name']))
        path = "/" + self.user_dir + "/"
        rule = self.access.set_acl_rule(download_ep_id, path, globus_user['id'], "r")
        if rule:
            self.log.info("Transfer enabled for {} ({})".format(globus_user['name'], globus_user['id']))
            self.log.info("    from ep: {} with directory {}".format(download_ep_id, self.user_dir))
        else:
            self.log.info("Transfer ACL failed")
        self.log.info("Expose - end")

    @staticmethod
    def make_random_name(prefix):
        number = "%05d" % randint(0, 99999)
        return prefix + number
