import logging
import os

from ..database.DatabaseInterface import DatabaseInterface
from ..database.BackgroundProcess import BackgroundProcess
from ..globus.GlobusMCUploadPrepare import GlobusMCUploadPrepare
from ..globus.GlobusMCTransfer import GlobusMCTransfer
from ..globus.GlobusMCBuiltProjectExperimentFromELT import GlobusMCBuiltProjectExperimentFromELT


def startup_and_verify(user_id, project_id, experiment_name, experiment_description,
                       globus_endpoint, globus_base_path, rel_excel_file_path, rel_data_dir_path):
    log = logging.getLogger(__name__ + ".startup_and_verify")
    log.info("Starting startup_and_verify")

    log.info("user_id = {}".format(user_id))
    log.info("project_id = {}".format(project_id))
    log.info("experiment_name = {}".format(experiment_name))
    log.info("experiment_description = {}".format(experiment_description))
    log.info("globus_endpoint = {}".format(globus_endpoint))
    log.info("base_path = {}".format(globus_base_path))
    log.info("excel_file_path = {}".format(rel_excel_file_path))
    log.info("data_dir_path = {}".format(rel_data_dir_path))

    status_record_id = None

    # noinspection PyBroadException
    try:

        handler = GlobusMCUploadPrepare(user_id)
        log.info("Starting setup")
        status_record_id = handler.setup_etl(project_id, experiment_name, experiment_description,
                                             globus_endpoint, globus_base_path,
                                             rel_excel_file_path, rel_data_dir_path)
        log.info("Starting verify")
        verify_status = handler.verify(status_record_id)
        log.info("Verify status = {}".format(verify_status))

        if not verify_status['status'] == 'SUCCESS':
            handler.cleanup_on_error()
            log.info("Aborting Transfer and ELT because of verify_status failure(s) = {}".format(verify_status))
            DatabaseInterface().update_status(status_record_id, BackgroundProcess.FAIL)
            return verify_status

        from ..faktory.TaskChain import GLOBUS_QUEUE
        DatabaseInterface().update_queue(status_record_id, GLOBUS_QUEUE)
        DatabaseInterface().update_status(status_record_id, BackgroundProcess.SUBMITTED_TO_QUEUE)
        from ..faktory.TaskChain import TaskChain
        task_chain = TaskChain()
        task_chain.start_elt_chain(status_record_id)

        verify_status['status_record_id'] = status_record_id

        return verify_status

    except BaseException:
        DatabaseInterface().update_status(status_record_id, BackgroundProcess.FAIL)
        message = "Unexpected failure; status_record_id = {}".format(status_record_id)
        logging.exception(message)
        return status_record_id


def elt_globus_upload(status_record_id):
    # noinspection PyBroadException
    try:
        from ..faktory.TaskChain import EXCEL_PROCESS_QUEUE
        log = logging.getLogger(__name__ + ".elt_globus_upload")
        log.info("Starting elt_globus_upload with status_record_id{}".format(status_record_id))
        DatabaseInterface().update_status(status_record_id, BackgroundProcess.RUNNING)

        status_record = DatabaseInterface().update_status(status_record_id, BackgroundProcess.RUNNING)
        user_id = status_record['owner']
        handler = GlobusMCTransfer(user_id)
        log.info("Starting transfer")
        transfer_status = handler.transfer_and_await(status_record_id)
        log.info("Transfer status = {}".format(transfer_status))

        if not transfer_status['status'] == 'SUCCEEDED':
            handler.cleanup_on_error()
            log.info("Aborting ETL because of transfer failure(s) = {}".format(transfer_status))
            return None

        DatabaseInterface().update_queue(status_record_id, EXCEL_PROCESS_QUEUE)
        DatabaseInterface().update_status(status_record_id, BackgroundProcess.SUBMITTED_TO_QUEUE)
        from ..faktory.TaskChain import TaskChain
        task_chain = TaskChain()
        task_chain.queue_excel_processing(status_record_id)
        return status_record_id

    except BaseException:
        DatabaseInterface().update_status(status_record_id, BackgroundProcess.FAIL)
        message = "Unexpected failure; status_record_id = {}".format(status_record_id)
        logging.exception(message)
        return status_record_id


def etl_excel_processing(status_record_id):
    # noinspection PyBroadException
    try:
        log = logging.getLogger(__name__ + ".etl_excel_processing")
        log.info("Starting etl_excel_processing with status_record_id{}".format(status_record_id))

        handler = GlobusMCBuiltProjectExperimentFromELT()
        log.info("Starting ETL")
        etl_status = handler.build_experiment(status_record_id)
        log.info("ETL status = {}".format(etl_status))

        if not etl_status['status'] == 'SUCCEEDED':
            DatabaseInterface().update_status(status_record_id, BackgroundProcess.FAIL)
            log.error(etl_status)
            return

        DatabaseInterface().update_status(status_record_id, BackgroundProcess.SUCCESS)
        log.info("Build Experiment Success{}".format(etl_status))

    except BaseException:
        DatabaseInterface().update_status(status_record_id, BackgroundProcess.FAIL)
        message = "Unexpected failure; status_record_id = {}".format(status_record_id)
        logging.exception(message)
