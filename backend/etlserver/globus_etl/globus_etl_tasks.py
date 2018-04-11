import os
import logging
import configparser
from .BuildProjectExperiment import BuildProjectExperiment
from ..DatabaseInterface import DatabaseInterface
from .BackgroundProcess import BackgroundProcess
from .MaterialsCommonsGlobusInterface import MaterialsCommonsGlobusInterface
from .VerifySetup import VerifySetup
from ..mcexceptions import MaterialsCommonsException

from ..faktory.TaskChain import GLOBUS_QUEUE, PROCESS_QUEUE

class ETLSetup:
    def __init__(self, user_id):
        self.user_id = user_id
        self.log = logging.getLogger(__name__ + "." + self.__class__.__name__)
        user_endoint_config_file_path = os.path.join('.globus_test', 'endpoint.ini')
        config_file_locaton_for_user_endpoint = os.path.join(os.path.expanduser("~"), user_endoint_config_file_path)
        config = configparser.ConfigParser()
        config.read(str(config_file_locaton_for_user_endpoint))
        self.worker_base_path = config['worker']['base_path']

    def run_with(self, project_id, experiment_name, experiment_description,
                 globus_endpoint, endpoint_path,
                 excel_file_relative_path, data_dir_relative_path):

        status_record = DatabaseInterface().\
            create_status_record(self.user_id, project_id, "ETL Process")
        status_record_id = status_record['id']
        base_path = self.worker_base_path
        # use os.path
        transfer_base_path = "{}/transfer-{}".format(base_path, status_record_id)
        excel_file_path = "{}/{}".format(transfer_base_path, excel_file_relative_path)
        data_file_path = "{}/{}".format(transfer_base_path, data_dir_relative_path)
        self.log.info("excel_file_path = " + excel_file_path)
        self.log.info("data_file_path = " + data_file_path)
        extras = {
            "experiment_name": experiment_name,
            "experiment_description": experiment_description,
            "globus_endpoint": globus_endpoint,
            "endpoint_path": endpoint_path,
            "transfer_base_path": transfer_base_path,
            "excel_file_relative_path": excel_file_relative_path,
            "data_dir_relative_path": data_dir_relative_path
        }
        status_record = DatabaseInterface().add_extras_data_to_status_record(status_record_id, extras)
        status_record_id = status_record['id']
        self.log.info("status record id = " + status_record_id)
        # =================== End of setup ===========================

        # ===========  verify_preconditions: could be run in task queue,
        #                           but want feedback on error to get to user, immediately
        results = self.verify_preconditions(status_record_id)
        if not results['status'] == 'SUCCEEDED':
            # here we return error messaage to user!
            self.log.error("Preconditions for transfer failed...")
            for key in results:
                self.log.error(" Failure: " + key + " :: " + results[key])
            return
        self.log.info(results)
        DatabaseInterface().update_queue(status_record_id, GLOBUS_QUEUE)
        DatabaseInterface().update_status(status_record_id, BackgroundProcess.SUBMITTED_TO_QUEUE)
        # queue on GLOBUS_QUEUE with status_record_id
        # =================== End of verify_preconditions =====================

    def verify_preconditions(self, status_record_id):
        status_record = DatabaseInterface().update_status(status_record_id, BackgroundProcess.VERIFYING_SETUP)
        project_id = status_record['project_id']
        globus_endpoint = status_record['extras']['globus_endpoint']
        endpoint_path = status_record['extras']['endpoint_path']
        transfer_base_path = status_record['extras']['transfer_base_path']
        excel_file_relative_path = status_record['extras']['excel_file_relative_path']
        data_dir_relative_path = status_record['extras']['data_dir_relative_path']

        web_service = MaterialsCommonsGlobusInterface(self.user_id)
        checker = VerifySetup(web_service, project_id,
                              globus_endpoint, endpoint_path, transfer_base_path,
                              excel_file_relative_path, data_dir_relative_path)
        return checker.status()
