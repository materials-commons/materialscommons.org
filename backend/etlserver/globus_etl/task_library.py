import logging
from ..DatabaseInterface import DatabaseInterface
from ..faktory.TaskChain import PROCESS_QUEUE
from .BackgroundProcess import BackgroundProcess
from .MaterialsCommonsGlobusInterface import MaterialsCommonsGlobusInterface
from .BuildProjectExperiment import BuildProjectExperiment
from ..mcexceptions import MaterialsCommonsException


def elt_globus_upload(status_record_id):
    log = logging.getLogger(__name__ + ".elt_globus_upload")
    log.info("Starting elt_globus_upload with status_record_id{}".format(status_record_id))
    DatabaseInterface().update_status(status_record_id, BackgroundProcess.RUNNING)
    results = globus_transfer(status_record_id)
    log.info(results)
    if not results['status'] == 'SUCCEEDED':
        DatabaseInterface().update_status(status_record_id, BackgroundProcess.FAIL)
        log.error(results)
        return
    log.info(results)
    DatabaseInterface().update_queue(status_record_id, PROCESS_QUEUE)
    DatabaseInterface().update_status(status_record_id, BackgroundProcess.SUBMITTED_TO_QUEUE)
    from ..faktory.TaskChain import TaskChain
    task_chain = TaskChain()
    task_chain.queue_excel_processing(status_record_id)


def etl_excel_processing(status_record_id):
    log = logging.getLogger(__name__ + ".etl_excel_processing")
    log.info("Starting etl_excel_processing with status_record_id{}".format(status_record_id))
    status_record = DatabaseInterface().update_status(status_record_id, BackgroundProcess.RUNNING)
    project_id = status_record['project_id']
    experiment_name = status_record['extras']['experiment_name']
    experiment_description = status_record['extras']['experiment_description']
    excel_file_path = status_record['extras']['excel_file_path']
    data_file_path = status_record['extras']['data_file_path']

    results = build_experiment(project_id, experiment_name, experiment_description,
                                    excel_file_path, data_file_path)
    if not results['status'] == 'SUCCEEDED':
        DatabaseInterface().update_status(status_record_id, BackgroundProcess.FAIL)
        log.error(results)
        return
    DatabaseInterface().update_queue(status_record_id, None)
    DatabaseInterface().update_status(status_record_id, BackgroundProcess.SUCCESS)
    log.info("Build Experiment Sucess{}".format(results))

def globus_transfer(status_record_id):
    log = logging.getLogger(__name__ + ".elt_globus_upload.globus_transfer")
    status_record = DatabaseInterface().update_status(status_record_id, BackgroundProcess.VERIFYING_SETUP)
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
        log("Starting Experiment Build: {}, {}".format(project_id, experiment_name))
        builder = BuildProjectExperiment()
        builder.set_rename_is_ok(True)
        builder.preset_project_id(project_id)
        builder.preset_experiment_name_description(experiment_name, experiment_description)
        builder.build(excel_file_path, data_file_path)
        log("Starting Experiment Build Sucess: {}, {}".format(project_id, experiment_name))
        return {"status": "SUCCEEDED", "results": builder.__dict__}
    except MaterialsCommonsException as e:
        log("Starting Experiment Build Fail: {}, {}".format(project_id, experiment_name))
        return {"status": "FAILED", "error": e}
