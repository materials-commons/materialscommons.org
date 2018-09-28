import logging
import os

from ..database.DatabaseInterface import DatabaseInterface
from ..database.BackgroundProcess import BackgroundProcess
# noinspection PyProtectedMember
from ..user.apikeydb import _load_apikeys as init_api_keys, user_apikey
from .BuildProjectExperimentWithETL import BuildProjectExperiment


class GlobusMCBuiltProjectExperimentFromELT:
    def __init__(self):
        self.log = logging.getLogger(__name__ + "." + self.__class__.__name__)
    
    def build_experiment(self,status_record_id):
        try:
            self.log.info("Starting etl_excel_processing with status_record_id{}".format(status_record_id))
            status_record = DatabaseInterface().update_status(status_record_id, BackgroundProcess.RUNNING_ETL)
            user_id = status_record['owner']
            init_api_keys()
            apikey = user_apikey(user_id)
            project_id = status_record['project_id']
            experiment_name = status_record['extras']['experiment_name']
            experiment_description = status_record['extras']['experiment_description']
            transfer_base_path = status_record['extras']['transfer_base_path']
            excel_file_path = status_record['extras']['excel_file_path']
            data_dir_path = status_record['extras']['data_dir_path']

            self.log.info("excel_file_path = {}".format(excel_file_path))
            self.log.info("data_dir_path = {}".format(data_dir_path))
            self.log.info("transfer_base_path = {}".format(transfer_base_path))

            if excel_file_path.startswith('/'):
                excel_file_path = excel_file_path[1:]

            if data_dir_path.startswith('/'):
                data_dir_path = data_dir_path[1:]

            self.log.info("partial excel_file path = {}".format(excel_file_path))
            self.log.info("partial data_dir path = {}".format(data_dir_path))

            excel_file_path = os.path.join(transfer_base_path, excel_file_path)
            data_dir_path = os.path.join(transfer_base_path, data_dir_path)

            self.log.info("full excel_file_path = {}".format(excel_file_path))
            self.log.info("full data_dir_path = {}".format(data_dir_path))

            self.log.info("Starting Experiment Build: {}, {}".format(project_id, experiment_name))
            builder = BuildProjectExperiment(apikey)
            builder.set_rename_is_ok(True)
            builder.preset_project_id(project_id)
            builder.preset_experiment_name_description(experiment_name, experiment_description)
            builder.build(excel_file_path, data_dir_path)
            self.log.info("Experiment Build Success: {}, {}".format(project_id, experiment_name))
            self.log.info("-------------------->{}".format(builder.experiment.id))
            DatabaseInterface().update_queue(status_record_id, None)
            DatabaseInterface().update_extras_data_on_status_record(
                status_record_id,
                {
                    'experiment_id': builder.experiment.id
                }
            )
            DatabaseInterface().update_status(status_record_id, BackgroundProcess.SUCCESS)
            results = {"status": "SUCCEEDED", "results": builder}
            self.log.info("Build Experiment Status = {}".format(results))
            return results
        except BaseException as e:
            DatabaseInterface().update_status(status_record_id, BackgroundProcess.FAIL)
            message = "Unexpected failure; status_record_id = {}".format(status_record_id)
            self.log.error(message)
            logging.exception(e, message)
            return {"status": "FAILED", "error": e}
