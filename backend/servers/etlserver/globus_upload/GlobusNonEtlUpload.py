import logging
import os

from ..common.MaterialsCommonsGlobusInterface import MaterialsCommonsGlobusInterface

class GlobusNonEtlUpload:
    def __init__(self, project, globus_endpoint, upload_base):
        self.log = logging.getLogger(__name__ + "." + self.__class__.__name__)
        self.log.info("init - started")
        self.project = project
        self.globus_endpoint = globus_endpoint
        self.globus_endpoint_path = '/'
        self.upload_base = upload_base
        self.last_status = None
        self.task_id = None
        self.service = MaterialsCommonsGlobusInterface(self.project.owner)
        self.service.set_transfer_client()
        self.log.info("init - done")

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
        self.log.info("upload_souce_path = {}".format(combined_path))
        current_directory = os.getcwd()
        os.chdir(combined_path)

        directory = self.project.get_top_directory()

        for f_or_d in os.listdir('.'):
            if os.path.isfile(f_or_d):
                directory.add_file(str(f_or_d), str(f_or_d), True)
            if os.path.isdir(f_or_d):
                directory.add_directory_tree(str(f_or_d), '.', True)

        os.chdir(current_directory)
