import logging
import os

from ..common.MaterialsCommonsGlobusInterface import MaterialsCommonsGlobusInterface
from ..common.McdirHelper import McdirHelper
from ..common.VerifySetup import VerifySetup
from ..database.BackgroundProcess import BackgroundProcess
from ..database.DatabaseInterface import DatabaseInterface


class GlobusMCUploadPrepare:
    def __init__(self, mc_user_id):
        self.log = logging.getLogger(__name__ + "." + self.__class__.__name__)
        self.log.info("init - started")
        self.mc_user_id = mc_user_id
        self.project_id = None
        self.globus_endpoint = None
        self.endpoint_path = None
        self.globus_destination_path = None
        self.mc_globus_interface = None
        self.worker_base_path = McdirHelper().get_upload_dir()
        self.log.info("init - done")

    def setup_etl(self, project_id, experiment_name, experiment_description, globus_endpoint,
                  globue_endpoint_base_path, excel_file_path, data_dir_path):
        self.log.info("starting setup of status record; user_id = {}; project_id = {}"
                      .format(self.mc_user_id, project_id))

        self.project_id = project_id
        project = DatabaseInterface().get_project(project_id)
        project_name = (project['name'] if project else 'undefined')

        status_record = DatabaseInterface(). \
            create_status_record(self.mc_user_id, project_id, "ETL Process")

        status_record_id = status_record['id']
        self.log.info("status_record_id = {}".format(status_record_id))

        DatabaseInterface().update_status(status_record_id, BackgroundProcess.INITIALIZATION)

        base_path = self.worker_base_path
        transfer_dir = self.make_transfer_dir('etl-transfer', status_record_id)
        globus_destination_path = self.make_globus_destination_path(transfer_dir)
        transfer_base_path = os.path.join(base_path, transfer_dir)
        self.log.info("excel_file_path = " + excel_file_path)
        self.log.info("data_file_path = " + data_dir_path)
        self.log.info("transfer_dir = {}".format(transfer_dir))
        self.log.info("transfer_base_path = {}".format(transfer_base_path))
        self.log.info("globus_destination_path = {}".format(globus_destination_path))
        extras = {
            "experiment_name": experiment_name,
            "experiment_description": experiment_description,
            "transfer_base_path": transfer_base_path,
            "globus_endpoint": globus_endpoint,
            "globus_path": globue_endpoint_base_path,
            "globus_destination_path": globus_destination_path,
            "excel_file_path": excel_file_path,
            "data_dir_path": data_dir_path,
            "label": "upload to project {}".format(project_name)
        }
        self.log.info("Status record extras:")
        for key in extras:
            self.log.info("  {} = {}".format(key, extras[key]))
        status_record = DatabaseInterface().add_extras_data_to_status_record(status_record_id, extras)
        status_record_id = status_record['id']
        self.log.info("status record id = " + status_record_id)

        self.globus_destination_path = globus_destination_path
        self.mc_globus_interface = MaterialsCommonsGlobusInterface(self.mc_user_id)
        self.mc_globus_interface.setup_transfer_clients()
        self.mc_globus_interface.set_user_access_rule(self.globus_destination_path)

        return status_record_id

    def cleanup_on_error(self):
        self.mc_globus_interface.clear_user_access_rule(self.globus_destination_path)

    def setup_non_etl(self, project_id, endpoint, path):
        self.project_id = project_id
        project = DatabaseInterface().get_project(project_id)
        project_name = (project['name'] if project else 'undefined')

        self.globus_endpoint = endpoint
        self.endpoint_path = path
        self.log.info("starting setup of status record; user_id = {}; project_id = {}"
                      .format(self.mc_user_id, self.project_id))
        status_record = DatabaseInterface(). \
            create_status_record(self.mc_user_id, self.project_id, "Non-ETL File Upload Process")

        status_record_id = status_record['id']
        self.log.info("status_record_id = {}".format(status_record_id))

        DatabaseInterface().update_status(status_record_id, BackgroundProcess.INITIALIZATION)

        base_path = self.worker_base_path
        transfer_dir = self.make_transfer_dir('transfer', status_record_id)
        globus_destination_path = self.make_globus_destination_path(transfer_dir)
        transfer_base_path = os.path.join(base_path, transfer_dir)
        self.log.info("transfer_dir = {}".format(transfer_dir))
        self.log.info("transfer_base_path = {}".format(transfer_base_path))
        self.log.info("globus_destination_path = {}".format(globus_destination_path))
        extras = {
            "transfer_base_path": transfer_base_path,
            "globus_endpoint": self.globus_endpoint,
            "globus_path": self.endpoint_path,
            "globus_destination_path": globus_destination_path,
            "label": "upload to project {}".format(project_name)
        }
        self.log.info("Status record extras:")
        for key in extras:
            self.log.info("  {} = {}".format(key, extras[key]))
        status_record = DatabaseInterface().add_extras_data_to_status_record(status_record_id, extras)
        status_record_id = status_record['id']
        self.log.info("status record id = " + status_record_id)

        mc_globus_interface = MaterialsCommonsGlobusInterface(self.mc_user_id)
        mc_globus_interface.setup_transfer_clients()
        mc_globus_interface.set_user_access_rule(globus_destination_path)

        return status_record_id

    def verify(self, status_record_id):
        results = self._verify_preconditions(status_record_id)
        if not results['status'] == 'SUCCESS':
            # here we return error message to user!
            self.log.error("Preconditions for transfer failed...")
            for key in results['messages']:
                self.log.error("  Failure: {} :: {}".format(key, results['messages'][key]))
            return results
        self.log.debug(results)
        return results

    def _verify_preconditions(self, status_record_id):
        status_record = DatabaseInterface().update_status(status_record_id, BackgroundProcess.VERIFYING_SETUP)
        project_id = status_record['project_id']
        globus_source_endpoint = status_record['extras']['globus_endpoint']
        globus_path_path = status_record['extras']['globus_path']
        transfer_base_path = status_record['extras']['transfer_base_path']
        globus_destination_path = status_record['extras']['globus_destination_path']

        file_list = []
        if 'excel_file_path' in status_record['extras']:
            file_list.append(status_record['extras']['excel_file_path'])
        if 'data_dir_path' in status_record['extras']:
            file_list.append(status_record['extras']['data_dir_path'])

        mc_globus_interface = MaterialsCommonsGlobusInterface(self.mc_user_id)
        checker = VerifySetup(mc_globus_interface, project_id,
                              globus_source_endpoint, globus_path_path,
                              globus_destination_path,
                              transfer_base_path,
                              dir_file_list=file_list)
        return checker.status()

    @staticmethod
    def make_transfer_dir(prefix, status_record_id):
        return "{}-{}".format(prefix, status_record_id)

    @staticmethod
    def make_globus_destination_path(transfer_dir_path):
        return '/{}/'.format(os.path.join("__upload_staging", transfer_dir_path))
