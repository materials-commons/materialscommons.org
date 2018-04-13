import logging
import os
from ..DatabaseInterface import DatabaseInterface
from ..BackgroundProcess import BackgroundProcess
from .MaterialsCommonsGlobusInterface import MaterialsCommonsGlobusInterface
from .BuildProjectExperiment import BuildProjectExperiment
from ..mcexceptions import MaterialsCommonsException
from .ETLSetup import ETLSetup


def startup_and_verify(user_id, project_id, experiment_name, experiment_description,
                       globus_endpoint, endpoint_path,
                       excel_file_relative_path, data_dir_relative_path):
    log = logging.getLogger(__name__ + ".startup_and_verify")
    log.info("Starting startup_and_verify")

    status_record_id = None
    try:
        setup = ETLSetup(user_id)
        status_record_id = \
            setup.setup_status_record(project_id, experiment_name, experiment_description,
                                      globus_endpoint, endpoint_path,
                                      excel_file_relative_path, data_dir_relative_path)
        if not status_record_id:
            log.error("Unable to create status_record_id")
            return {"status": "FAIL"}
        check = setup.verify_setup(status_record_id)
        if not check['status'] == "SUCCESS":
            log.error("Failed to verify setup; status_record_id = {}".format(status_record_id))
            DatabaseInterface().update_status(status_record_id, BackgroundProcess.FAIL)
            return check

        from ..faktory.TaskChain import GLOBUS_QUEUE
        DatabaseInterface().update_queue(status_record_id, GLOBUS_QUEUE)
        DatabaseInterface().update_status(status_record_id, BackgroundProcess.SUBMITTED_TO_QUEUE)
        from ..faktory.TaskChain import TaskChain
        task_chain = TaskChain()
        task_chain.start_chain(status_record_id)
        check['status_record_id'] = status_record_id
    except BaseException as e:
        message = "Unexpected failure; status_record_id = None"
        if status_record_id:
            DatabaseInterface().update_status(status_record_id, BackgroundProcess.FAIL)
            message = "Unexpected failure; status_record_id = {}".format(status_record_id)
        logging.exception(message)
        return {"status": "FAIL"}
    return check


def elt_globus_upload(status_record_id):
    try:
        from ..faktory.TaskChain import PROCESS_QUEUE
        log = logging.getLogger(__name__ + ".elt_globus_upload")
        log.info("Starting elt_globus_upload with status_record_id{}".format(status_record_id))
        DatabaseInterface().update_status(status_record_id, BackgroundProcess.RUNNING)
        results = globus_transfer(status_record_id)
        log.info(results)
        if not results['status'] == 'SUCCEEDED':
            DatabaseInterface().update_status(status_record_id, BackgroundProcess.FAIL)
            log.error(results)
            return None
        log.info(results)
        DatabaseInterface().update_queue(status_record_id, PROCESS_QUEUE)
        DatabaseInterface().update_status(status_record_id, BackgroundProcess.SUBMITTED_TO_QUEUE)
        from ..faktory.TaskChain import TaskChain
        task_chain = TaskChain()
        task_chain.queue_excel_processing(status_record_id)
        return status_record_id
    except BaseException as e:
        DatabaseInterface().update_status(status_record_id, BackgroundProcess.FAIL)
        message = "Unexpected failure; status_record_id = {}".format(status_record_id)
        logging.exception(message)
        return None


def etl_excel_processing(status_record_id):
    try:
        log = logging.getLogger(__name__ + ".etl_excel_processing")
        log.info("Starting etl_excel_processing with status_record_id{}".format(status_record_id))
        status_record = DatabaseInterface().update_status(status_record_id, BackgroundProcess.RUNNING)
        project_id = status_record['project_id']
        experiment_name = status_record['extras']['experiment_name']
        experiment_description = status_record['extras']['experiment_description']
        base_path = status_record['extras']['transfer_base_path']
        excel_file_relative_path = status_record['extras']['excel_file_relative_path']
        data_dir_relative_path = status_record['extras']['data_dir_relative_path']

        excel_file_path = os.path.join(base_path, excel_file_relative_path)
        data_dir_path = os.path.join(base_path, data_dir_relative_path)

        results = build_experiment(project_id, experiment_name, experiment_description,
                                   excel_file_path, data_dir_path)
        if not results['status'] == 'SUCCEEDED':
            DatabaseInterface().update_status(status_record_id, BackgroundProcess.FAIL)
            log.error(results)
            return
        DatabaseInterface().update_queue(status_record_id, None)
        DatabaseInterface().update_status(status_record_id, BackgroundProcess.SUCCESS)
        log.info("Build Experiment Success{}".format(results))
    except BaseException as e:
        DatabaseInterface().update_status(status_record_id, BackgroundProcess.FAIL)
        message = "Unexpected failure; status_record_id = {}".format(status_record_id)
        logging.exception(message)


def globus_transfer(status_record_id):
    log = logging.getLogger(__name__ + ".elt_globus_upload.globus_transfer")
    status_record = DatabaseInterface().get_status_record(status_record_id)
    transfer_id = status_record_id
    user_id = status_record['owner']
    project_id = status_record['project_id']
    globus_endpoint = status_record['extras']['globus_endpoint']
    endpoint_path = status_record['extras']['endpoint_path']
    web_service = MaterialsCommonsGlobusInterface(user_id)
    log.info("set_transfer_client")
    results = web_service.set_transfer_client()
    if results['status'] == 'error':
        return results

    log.info("stage_upload_files")
    results = web_service.stage_upload_files(project_id, transfer_id, globus_endpoint, endpoint_path)
    log.info("results of staging: ", results)
    task_id = results['task_id']
    poll = True
    while poll:
        results = web_service.get_task_status(task_id)
        poll = (results['status'] == 'ACTIVE')
    log.info(results)
    return results


def build_experiment(project_id, experiment_name, experiment_description,
                     excel_file_path, data_file_path):
    log = logging.getLogger(__name__ + ".etl_excel_processing.build_experiment")
    try:
        log.info("Starting Experiment Build: {}, {}".format(project_id, experiment_name))
        builder = BuildProjectExperiment()
        builder.set_rename_is_ok(True)
        builder.preset_project_id(project_id)
        builder.preset_experiment_name_description(experiment_name, experiment_description)
        builder.build(excel_file_path, data_file_path)
        log.info("Starting Experiment Build Success: {}, {}".format(project_id, experiment_name))
        return {"status": "SUCCEEDED", "results": builder.__dict__}
    except MaterialsCommonsException as e:
        log.info("Starting Experiment Build Fail: {}, {}".format(project_id, experiment_name))
        return {"status": "FAILED", "error": e}
