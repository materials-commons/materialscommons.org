import logging
import os

from materials_commons.api import get_all_projects

from ..common.access_exceptions import NoSuchItem, AuthenticationException
from ..common.MaterialsCommonsGlobusInterface import MaterialsCommonsGlobusInterface


class Upload:

    def __init__(self, mc_user_id, project_id, endpoint):
        self.log = logging.getLogger(__name__ + "." + self.__class__.__name__)
        self.log.info("init - started")
        self.mc_user_id = mc_user_id
        self.project_id = project_id
        self.project = None
        self.globus_endpoint = endpoint
        self.globus_endpoint_path = '/'
        self.upload_base = os.environ.get('MC_ETL_BASE_DIR')
        self.last_status = None
        self.task_id = None
        self.service = MaterialsCommonsGlobusInterface(mc_user_id)
        self.log.info("mc_user_id = {}, project_id = {}, globus_endpoint = {}, globus_path = {}"
                      .format(self.mc_user_id, self.project_id,
                              self.globus_endpoint, self.globus_endpoint_path))
        self.log.info("init - done")

    def setup_and_verify(self):
        self.log.info("setup - started")
        self.log.info("Does project exist?")
        project_selected = None

        project_list = get_all_projects()

        for probe in project_list:
            if self.project_id == probe.id:
                project_selected = probe
                break

        if not project_selected:
            self.log.info("Found no matches for project_id {}".format(self.project_id))
            raise NoSuchItem("Found no matches for project_id {}".format(self.project_id))

        self.project = project_selected
        self.log.info("Found project: name = {}".format(self.project.name))

        self.log.info("Does MC User own project?")
        if not self.project.owner == self.mc_user_id:
            self.log.info("Project not owned by {} but by {}".format(self.mc_user_id, self.project.owner))
            raise AuthenticationException("Project not owned by {}".format(self.mc_user_id))
        self.log.info("Project owner is {}".format(self.mc_user_id))

        self.log.info("Upload base dir = {}".format(self.upload_base))
        if not os.path.isdir(self.upload_base):
            raise NoSuchItem("Base dir is no a directory: {}".format(self.upload_base))

        self.log.info("Setting up Globus transfer_client")
        self.service.set_transfer_client()
        self.log.info("Done with setup of Globus transfer_client")

        self.log.info("setup - done")

    def start_transfer(self, transfer_id):
        self.transfer_id = transfer_id
        self.log.info("start")
        results = self.service.stage_upload_files(
            self.project.id, transfer_id, self.globus_endpoint, self.globus_endpoint_path)
        self.log.info("start results = {}".format(results))
        self.task_id = None
        if results and results['code'] == 'Accepted':
            self.task_id = results['task_id']

    def is_transfer_running(self):
        if not self.task_id:
            return False
        results = self.service.get_task_status(self.task_id)
        self.log.info("task results = {}".format(results))
        self.last_status = results['status']
        return self.last_status == 'ACTIVE'

    def get_last_transfer_status(self):
        return self.last_status

    def move_data_dir_to_project(self):
        self.log.info("upload_base = {}; transfer_id = {}".format(self.upload_base, self.transfer_id))
        combined_path = os.path.join(self.upload_base, "transfer-" + self.transfer_id)
        self.log.info("ploading files and directories from = {}".format(combined_path))
        current_directory = os.getcwd()
        os.chdir(combined_path)
        directory = self.project.get_top_directory()

        file_count = 0
        dir_count = 0
        for f_or_d in os.listdir('.'):
            if os.path.isfile(f_or_d):
                file_count += 1
                directory.add_file(str(f_or_d), str(f_or_d))
            if os.path.isdir(f_or_d):
                dir_count += 1
                directory.add_directory_tree(str(f_or_d), '.')
        os.chdir(current_directory)

        self.log.info("Uploaded {} file(s) and {} dirs(s) to top level directory of project '{}'"
                      .format(file_count, dir_count, self.project.name))