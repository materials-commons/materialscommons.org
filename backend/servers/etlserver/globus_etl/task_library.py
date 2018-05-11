import logging
import os

# noinspection PyProtectedMember
from materials_commons.api import _use_remote as get_remote
# noinspection PyProtectedMember
from materials_commons.api import _Config as Config
# noinspection PyProtectedMember
from materials_commons.api import _Remote as Remote
# noinspection PyProtectedMember
from materials_commons.api import _set_remote as set_remote

from ..database.DatabaseInterface import DatabaseInterface
from ..database.BackgroundProcess import BackgroundProcess
from .MaterialsCommonsGlobusInterface import MaterialsCommonsGlobusInterface
from .BuildProjectExperiment import BuildProjectExperiment
from ..utils.mcexceptions import MaterialsCommonsException
from .ETLSetup import ETLSetup
from ..user.apikeydb import user_apikey
# noinspection PyProtectedMember
from ..user.apikeydb import _load_apikeys as init_api_keys


def startup_and_verify(user_id, project_id, experiment_name, experiment_description,
                       globus_endpoint, excel_file_path, data_dir_path):
    log = logging.getLogger(__name__ + ".startup_and_verify")
    log.debug("Starting startup_and_verify")

    status_record_id = None
    # noinspection PyBroadException
    try:
        setup = ETLSetup(user_id)
        status_record_id = \
            setup.setup_status_record(project_id, experiment_name, experiment_description,
                                      globus_endpoint, excel_file_path, data_dir_path)
        if not status_record_id:
            log.error("Unable to create status_record_id")
            return {"status": "FAIL"}
        check = setup.verify_setup(status_record_id)
        check['status_record_id'] = status_record_id
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
    except BaseException:
        message = "Unexpected failure; status_record_id = None"
        if status_record_id:
            DatabaseInterface().update_status(status_record_id, BackgroundProcess.FAIL)
            message = "Unexpected failure; status_record_id = {}".format(status_record_id)
        logging.exception(message)
        return {"status": "FAIL"}
    return check


def elt_globus_upload(status_record_id):
    # noinspection PyBroadException
    try:
        from ..faktory.TaskChain import PROCESS_QUEUE
        log = logging.getLogger(__name__ + ".elt_globus_upload")
        log.info("Starting elt_globus_upload with status_record_id{}".format(status_record_id))
        DatabaseInterface().update_status(status_record_id, BackgroundProcess.RUNNING)
        results = globus_transfer(status_record_id)
        log.debug(results)
        if not results['status'] == 'SUCCEEDED':
            DatabaseInterface().update_status(status_record_id, BackgroundProcess.FAIL)
            log.error(results)
            return None
        log.debug(results)
        DatabaseInterface().update_queue(status_record_id, PROCESS_QUEUE)
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
        status_record = DatabaseInterface().update_status(status_record_id, BackgroundProcess.RUNNING)
        user_id = status_record['owner']
        _set_global_python_api_remote_for_user(user_id)
        log.debug("apikey = '{}'".format(get_remote().config.mcapikey))
        project_id = status_record['project_id']
        experiment_name = status_record['extras']['experiment_name']
        experiment_description = status_record['extras']['experiment_description']
        transfer_base_path = status_record['extras']['transfer_base_path']
        excel_file_path = status_record['extras']['excel_file_path']
        data_dir_path = status_record['extras']['data_dir_path']

        log.debug("excel_file_path = {}".format(excel_file_path))
        log.debug("data_dir_path = {}".format(data_dir_path))
        log.debug("transfer_base_path = {}".format(transfer_base_path))

        if excel_file_path.startswith('/'):
            excel_file_path = excel_file_path[1:]

        if data_dir_path.startswith('/'):
            data_dir_path = data_dir_path[1:]

        log.debug("partial excel_file path = {}".format(excel_file_path))
        log.debug("partial data_dir path = {}".format(data_dir_path))

        excel_file_path = os.path.join(transfer_base_path, excel_file_path)
        data_dir_path = os.path.join(transfer_base_path, data_dir_path)

        log.debug("full excel_file_path = {}".format(excel_file_path))
        log.debug("full data_dir_path = {}".format(data_dir_path))

        results = build_experiment(project_id, experiment_name, experiment_description,
                                   excel_file_path, data_dir_path)
        if not results['status'] == 'SUCCEEDED':
            DatabaseInterface().update_status(status_record_id, BackgroundProcess.FAIL)
            log.error(results)
            return
        builder_out = results['results']
        log.debug("-------------------->{}".format(builder_out.experiment.id))
        DatabaseInterface().update_queue(status_record_id, None)
        DatabaseInterface().update_extras_data_on_status_record(
            status_record_id,
            {
                'experiment_id': builder_out.experiment.id
            }
        )
        DatabaseInterface().update_status(status_record_id, BackgroundProcess.SUCCESS)
        log.debug("Build Experiment Success{}".format(results))
    except BaseException:
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
    endpoint_path = '/'
    web_service = MaterialsCommonsGlobusInterface(user_id)
    log.debug("set_transfer_client")
    results = web_service.set_transfer_client()
    if results['status'] == 'error':
        return results

    log.debug("stage_upload_files")
    results = web_service.stage_upload_files(project_id, transfer_id, globus_endpoint, endpoint_path)
    log.debug("results of staging: ", results)
    task_id = results['task_id']
    poll = True
    while poll:
        results = web_service.get_task_status(task_id)
        poll = (results['status'] == 'ACTIVE')
    log.debug(results)
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
        log.debug("Experiment Build Success: {}, {}".format(project_id, experiment_name))
        return {"status": "SUCCEEDED", "results": builder}
    except MaterialsCommonsException as e:
        log.debug("Starting Experiment Build Fail: {}, {}".format(project_id, experiment_name))
        return {"status": "FAILED", "error": e}


def _set_global_python_api_remote_for_user(user_id):
    init_api_keys()
    api_key = user_apikey(user_id)
    if not api_key:
        raise MaterialsCommonsException("No apikey for user: " + user_id)
    config = Config(override_config={
        "apikey": api_key,
    })
    remote = Remote(config=config)
    set_remote(remote)
