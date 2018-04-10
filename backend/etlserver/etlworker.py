import os
import logging
import configparser
from .input_spreadsheet import BuildProjectExperiment
from .DatabaseInterface import DatabaseInterface
from .BackgroundProcess import BackgroundProcess
from .globus_service import MaterialsCommonsGlobusInterface
from .VerifySetup import VerifySetup
from .mcexceptions import MaterialsCommonsException

GLOBUS_QUEUE = 'elt:globus-transfer'
PROCESS_QUEUE = 'etl:build-experiment'


class ETLWorker:
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
        transfer_base_path = "{}/transfer-{}".format(base_path, status_record_id)
        excel_file_path = "{}/{}".format(transfer_base_path, excel_file_relative_path)
        data_file_path = "{}/{}".format(transfer_base_path, data_dir_relative_path)
        self.log.info("excel_file_path = " + excel_file_path)
        self.log.info("data_file_path = " + data_file_path)
        extras = {
            "experiment_naae": experiment_name,
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

        # =================== globus_transfer: stage 1 =====================
        #           To be run in task queue
        DatabaseInterface().update_status(status_record_id, BackgroundProcess.RUNNING)
        results = self.globus_transfer(status_record_id)
        self.log.info(results)
        if not results['status'] == 'SUCCEEDED':
            DatabaseInterface().update_queue(status_record_id, None)
            DatabaseInterface().update_status(status_record_id, BackgroundProcess.FAIL)
            # queue on GLOBUS_QUEUE with status_record_id
            self.log.error(results)
            return
        self.log.info(results)
        DatabaseInterface().update_queue(status_record_id, PROCESS_QUEUE)
        DatabaseInterface().update_status(status_record_id, BackgroundProcess.SUBMITTED_TO_QUEUE)
        # queue on PROCESS_QUEUE with status_record_id
        # =================== end of globus_transfer =======================

        # =================== build_experiment: stage 2 =====================
        DatabaseInterface().update_status(status_record_id, BackgroundProcess.RUNNING)
        results = self.build_experiment(project_id, experiment_name, experiment_description,
                              excel_file_path, data_file_path)
        if not results['status'] == 'SUCCEEDED':
            DatabaseInterface().update_queue(status_record_id, None)
            DatabaseInterface().update_status(status_record_id, BackgroundProcess.FAIL)
            # queue on GLOBUS_QUEUE with status_record_id
            self.log.error(results)
            return
        DatabaseInterface().update_queue(status_record_id, None)
        DatabaseInterface().update_status(status_record_id, BackgroundProcess.SUCCESS)
        print(results)

        # =================== end of build_experiment =======================

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

    def globus_transfer(self, status_record_id):
        status_record = DatabaseInterface().update_status(status_record_id, BackgroundProcess.VERIFYING_SETUP)
        transfer_id = status_record_id
        project_id = status_record['project_id']
        globus_endpoint = status_record['extras']['globus_endpoint']
        endpoint_path = status_record['extras']['endpoint_path']
        web_service = MaterialsCommonsGlobusInterface(self.user_id)
        self.log.info("set_transfer_client")
        results = web_service.set_transfer_client()
        if results['status'] == 'error':
            return results

        self.log.info("stage_upload_files")
        results = web_service.stage_upload_files(project_id, transfer_id, globus_endpoint, endpoint_path)
        self.log.info("results of staging: ", results)
        task_id = results['task_id']
        poll = True
        while poll:
            results = web_service.get_task_status(task_id)
            poll = (results['status'] == 'ACTIVE')
        self.log.info(results)
        return results

    @staticmethod
    def build_experiment(project_id, experiment_name, experiment_description,
                         excel_file_path, data_file_path):
        try:
            builder = BuildProjectExperiment()
            builder.set_rename_is_ok(True)
            builder.preset_project_id(project_id)
            builder.preset_experiment_name_description(experiment_name, experiment_description)
            builder.build(excel_file_path, data_file_path)
            return {"status": "SUCCEEDED", "results": builder.__dict__}
        except MaterialsCommonsException as e:
            return {"status": "FAILED", "error": e}
