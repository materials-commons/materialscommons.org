import logging
import os
from random import randint

from materials_commons.api import get_project_by_id

from ..common.GlobusAccess import GlobusAccess
from ..common.access_exceptions import RequiredAttributeException
from ..common.McdirHelper import McdirHelper


class GlobusDownload:
    def __init__(self, project_id, globus_user_id, apikey):
        self.log = logging.getLogger(self.__class__.__name__)
        self.log.info("init - started - globus_user_id = {}, project_id = {}".
                      format(globus_user_id, project_id))
        self.globus_user_id = globus_user_id
        self.project_id = project_id
        self.apikey = apikey
        self.file_list = None
        self.path_list = None
        self.transfer_client = None
        self.user_dir = None
        self.access = GlobusAccess()
        self.log.info("Using GlobusAccess implementation: {}".format(self.access.get_impl_type()))
        download_ep_id = os.environ.get('MC_DOWNLOAD_ENDPOINT_ID')
        #     download_endpoint_id = '84b62e46-5ebc-11e8-91d5-0a6d4e044368'
        self.log.info("Download endpoint id = {}".format(download_ep_id))
        if not download_ep_id:
            self.log.error("Download endpoint is not set: MC_DOWNLOAD_ENDPOINT_ID is undefined")
            raise RequiredAttributeException("MC_DOWNLOAD_ENDPOINT_ID is undefined")
        mcdir_helper = McdirHelper()
        self.download_dir = mcdir_helper.get_download_dir()
        self.download_ep_id = download_ep_id

    def download(self):
        self.setup()
        self.stage()
        self.expose()
        return self.exposed_ep_url()

    def setup(self):
        project = get_project_by_id(self.project_id, self.apikey)
        self.log.info("Get file list for project = {} ({})".
                      format(project.name, project.id))
        directory = project.get_top_directory()
        self.file_list = []
        self.path_list = []
        path = ""
        self.recursively_add_directory(path, directory)
        if not self.file_list:
            print("no files found")
            exit(-1)
        self.log.info("Found {} files.".format(len(self.file_list)))
        self.log.info("Found {} directory paths.".format(len(self.path_list)))
        for file in self.file_list:
            self.log.debug("File: {} - {}".format(file.name, file.path))
        for path in self.path_list:
            self.log.debug("Path {}".format(path))

    def recursively_add_directory(self, path, directory):
        if path:
            self.path_list.append(path)
        file_or_dir_list = directory.get_children()
        for file_or_dir in file_or_dir_list:
            instance_path = path + file_or_dir.name
            self.log.debug("File or dir otype = {}; name = {}; path = {}; {}"
                          .format(file_or_dir.otype, file_or_dir.name,
                                  file_or_dir.path, instance_path))
            if file_or_dir.otype == 'file':
                file_or_dir.path = instance_path
                self.file_list.append(file_or_dir)
            if file_or_dir.otype == "directory":
                self.recursively_add_directory(instance_path + '/', file_or_dir)

    def stage(self):
        self.log.info("Staging - start")
        mc_dirs = os.environ.get('MCDIR')
        mc_dir = mc_dirs.split(':')[0]
        self.log.debug("Staging - mc dir = {}".format(mc_dir))
        staging_dir = self.download_dir
        self.user_dir = self.make_random_name('testing-')
        self.log.debug("Staging - user dir = {}".format(self.user_dir))
        staging_dir = os.path.join(staging_dir, self.user_dir)
        self.log.info("Staging - staging dir = {}".format(staging_dir))
        os.makedirs(staging_dir)
        for path in self.path_list:
            staging_path = os.path.join(staging_dir, path)
            self.log.debug("About to create dir {}".format(staging_path))
            os.makedirs(staging_path)
        for file in self.file_list:
            id = file.id
            usesid = file.usesid
            if usesid:
                id = usesid
            p1 = id[9:11]
            p2 = id[11:13]
            file_path = os.path.join(mc_dir, p1, p2, id)
            link_path = os.path.join(staging_dir, file.path)
            os.link(file_path, link_path)
        self.log.info("Staging - end")

    def expose(self):
        self.log.info("Expose - start")
        self.log.info("Looking up globus identity of {}".format(self.globus_user_id))
        globus_user = self.access.get_globus_user(self.globus_user_id)
        if not globus_user:
            raise RequiredAttributeException("Missing Globus user identity")
        self.log.info("Globus user = {}, id = {}".format(globus_user['name'], globus_user['id']))
        confidential_client_endpoint = self.access.get_endpoint(self.download_ep_id)
        self.log.info("Expose - base ep = {}".format(confidential_client_endpoint['display_name']))
        # path = "/" + self.user_dir + "/"
        # rule = self.access.set_acl_rule(self.download_ep_id, path, globus_user['id'], "r")
        # if rule:
        #     self.log.info("Transfer enabled for {} ({})".format(globus_user['name'], globus_user['id']))
        #     self.log.info("    from ep: {} with directory {}".format(self.download_ep_id, self.user_dir))
        # else:
        #     self.log.info("Transfer ACL failed")
        self.log.info("Expose - end")

    def exposed_ep_url(self):
        origin_id = self.download_ep_id
        path = '%2F{}%2F'.format(self.user_dir)
        url_base = "https://www.globus.org/app/transfer"
        url = '{}?origin_id={}&origin_path={}'.format(url_base, origin_id, path)
        return url

    @staticmethod
    def make_random_name(prefix):
        number = "%05d" % randint(0, 99999)
        return prefix + number
