import logging
import os
from random import randint

from materials_commons.api import get_project_by_id

from ..common.MaterialsCommonsGlobusInterface import MaterialsCommonsGlobusInterface
from ..common.access_exceptions import RequiredAttributeException
from ..common.McdirHelper import McdirHelper


class GlobusDownload:
    def __init__(self, mc_user_id, apikey, project_id):
        self.log = logging.getLogger(self.__class__.__name__)
        self.mc_user_id = mc_user_id
        self.apikey = apikey
        self.project_id = project_id
        self.file_list = None
        self.path_list = None
        self.transfer_client = None
        self.user_dir = None
        self.mc_globus_interface = MaterialsCommonsGlobusInterface(mc_user_id)
        download_ep_id = os.environ.get('MC_CONFIDENTIAL_CLIENT_ENDPOINT')
        self.log.info("Download endpoint id = {}".format(download_ep_id))
        if not download_ep_id:
            self.log.error("Download endpoint is not set: MC_CONFIDENTIAL_CLIENT_ENDPOINT is undefined")
            raise RequiredAttributeException("MC_CONFIDENTIAL_CLIENT_ENDPOINT is undefined")
        self.download_ep_id = download_ep_id
        mcdir_helper = McdirHelper()
        self.mc_base = mcdir_helper.base_dir()
        self.download_dir = mcdir_helper.get_download_dir()
        self.mc_endpoint_path = None

    def download(self):
        if self.setup():
            self.stage()
            self.expose()
        return self.exposed_ep_url()

    def setup(self):
        self.mc_globus_interface.setup_transfer_clients()
        project = get_project_by_id(self.project_id, self.apikey)
        self.log.info("Get file list for project = {} ({})".
                      format(project.name, project.id))
        directory = project.get_top_directory()
        self.file_list = []
        self.path_list = []
        path = ""
        self.recursively_add_directory(path, directory)
        if not self.file_list:
            self.log.info("No files found.")
            return False

        self.log.info("Found {} files.".format(len(self.file_list)))
        self.log.info("Found {} directory paths.".format(len(self.path_list)))
        for file in self.file_list:
            self.log.debug("File: {} - {}".format(file.name, file.path))
        for path in self.path_list:
            self.log.debug("Path {}".format(path))
        return True

    def recursively_add_directory(self, path, directory):
        if path:
            self.path_list.append(path)
        file_or_dir_list = directory.get_children()
        for file_or_dir in file_or_dir_list:
            instance_path = path + file_or_dir.name
            self.log.debug("File or dir otype = {}; name = {}; path = {}; {}".
                           format(file_or_dir.otype, file_or_dir.name,
                                  file_or_dir.path, instance_path))
            if file_or_dir.otype == 'file':
                file_or_dir.path = instance_path
                self.file_list.append(file_or_dir)
            if file_or_dir.otype == "directory":
                self.recursively_add_directory(instance_path + '/', file_or_dir)

    def stage(self):
        self.log.info("Staging - start")
        staging_dir = self.download_dir
        self.user_dir = self.make_random_name('etl-download-')
        self.log.info("Staging - user_dir = {}".format(self.user_dir))
        staging_dir = os.path.join(staging_dir, self.user_dir)
        self.log.info("Staging - staging_dir = {}".format(staging_dir))
        self.mc_endpoint_path = "/__download_staging/" +  self.user_dir + "/"
        self.log.info("Staging - mc_endpoint_path = {}".format(self.mc_endpoint_path))

        os.makedirs(staging_dir)
        for path in self.path_list:
            staging_path = os.path.join(staging_dir, path)
            self.log.debug("About to create dir {}".format(staging_path))
            os.makedirs(staging_path)
        for file in self.file_list:
            file_id = file.id
            usesid = file.usesid
            if usesid:
                file_id = usesid
            p1 = file_id[9:11]
            p2 = file_id[11:13]
            file_path = os.path.join(self.mc_base, p1, p2, file_id)
            link_path = os.path.join(staging_dir, file.path)
            os.link(file_path, link_path)
        self.log.info("Staging - end")

    def expose(self):
        self.log.info("Expose - start")
        self.log.info("Setting ACL rule for path = {}".format(self.mc_endpoint_path))
        self.mc_globus_interface.set_user_access_rule(self.mc_endpoint_path)
        self.log.info("Expose - end")

    def exposed_ep_url(self):
        origin_id = self.download_ep_id
        path = '%2F{}%2F'.format(self.mc_endpoint_path)
        url_base = "https://www.globus.org/app/transfer"
        url = '{}?origin_id={}&origin_path={}'.format(url_base, origin_id, path)
        return url

    @staticmethod
    def make_random_name(prefix):
        number = "%05d" % randint(0, 99999)
        return prefix + number

