import logging
import os

from materials_commons.api import get_project_by_id

from ..database.DatabaseInterface import DatabaseInterface
from ..database.BackgroundProcess import BackgroundProcess
from ..common.MaterialsCommonsGlobusInterface import MaterialsCommonsGlobusInterface
# noinspection PyProtectedMember
from ..user.apikeydb import _load_apikeys as init_api_keys, user_apikey

from .NonEtlSetup import NonEtlSetup


def startup_and_verify(user_id, project_id, globus_endpoint):
    log = logging.getLogger(__name__ + ".startup_and_verify")
    log.info("Starting startup_and_verify")

    status_record_id = None
    # noinspection PyBroadException
    try:
        setup = NonEtlSetup(user_id)
        status_record_id = \
            setup.setup_status_record(project_id, globus_endpoint)
        if not status_record_id:
            log.error("Unable to create status_record_id")
            return {"status": "FAIL"}
        log.info("setup.setup_status_record passed")
        check = setup.verify_setup(status_record_id)
        check['status_record_id'] = status_record_id
        if not check['status'] == "SUCCESS":
            log.error("Failed to verify setup; status_record_id = {}".format(status_record_id))
            DatabaseInterface().update_status(status_record_id, BackgroundProcess.FAIL)
            return check
        log.info("setup.verify_setup passed")

        from ..faktory.TaskChain import FILE_UPLOAD_QUEUE
        DatabaseInterface().update_queue(status_record_id, FILE_UPLOAD_QUEUE)
        DatabaseInterface().update_status(status_record_id, BackgroundProcess.SUBMITTED_TO_QUEUE)
        log.info("updated status record queue to {} and status to {}"
                 .format(FILE_UPLOAD_QUEUE, BackgroundProcess.SUBMITTED_TO_QUEUE))
        from ..faktory.TaskChain import TaskChain
        task_chain = TaskChain()
        task_chain.start_non_etl_chain(status_record_id)
        log.info("Called task_chain.start_non_etl_chain")
        check['status_record_id'] = status_record_id
    except BaseException:
        message = "Unexpected failure; status_record_id = None"
        if status_record_id:
            DatabaseInterface().update_status(status_record_id, BackgroundProcess.FAIL)
            message = "Unexpected failure; status_record_id = {}".format(status_record_id)
        logging.exception(message)
        return {"status": "FAIL"}
    return check


def non_elt_globus_upload(status_record_id):
    # noinspection PyBroadException
    try:
        from ..faktory.TaskChain import FILE_PROCESS_QUEUE
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
        DatabaseInterface().update_queue(status_record_id, FILE_PROCESS_QUEUE)
        DatabaseInterface().update_status(status_record_id, BackgroundProcess.SUBMITTED_TO_QUEUE)
        from ..faktory.TaskChain import TaskChain
        task_chain = TaskChain()
        task_chain.queue_non_etl_file_transformation(status_record_id)
        return status_record_id
    except BaseException:
        DatabaseInterface().update_status(status_record_id, BackgroundProcess.FAIL)
        message = "Unexpected failure; status_record_id = {}".format(status_record_id)
        logging.exception(message)
        return status_record_id


def non_etl_file_processing(status_record_id):
    # noinspection PyBroadException
    try:
        log = logging.getLogger(__name__ + ".etl_excel_processing")
        log.info("Starting etl_excel_processing with status_record_id{}".format(status_record_id))
        status_record = DatabaseInterface().update_status(status_record_id, BackgroundProcess.RUNNING)
        user_id = status_record['owner']
        init_api_keys()
        apikey = user_apikey(user_id)
        project_id = status_record['project_id']

        transfer_base_path = status_record['extras']['transfer_base_path']

        project = get_project_by_id(project_id, apikey=apikey)
        log.info("working with project '{}' ({})".format(project.name, project.id))

        log.info("loading files and directories from = {}".format(transfer_base_path))
        current_directory = os.getcwd()
        os.chdir(transfer_base_path)
        directory = project.get_top_directory()

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

        log.info("Uploaded {} file(s) and {} dirs(s) to top level directory of project '{}'"
                 .format(file_count, dir_count, project.name))

        DatabaseInterface().update_queue(status_record_id, None)
        DatabaseInterface().update_status(status_record_id, BackgroundProcess.SUCCESS)
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


def non_etl_globus_upload(status_record_id):
    # noinspection PyBroadException
    try:
        log = logging.getLogger(__name__ + ".etl_excel_processing")
        log.info("Starting etl_excel_processing with status_record_id{}".format(status_record_id))
        status_record = DatabaseInterface().update_status(status_record_id, BackgroundProcess.RUNNING)
        # noinspection PyUnusedLocal
        user_id = status_record['owner']
        project_id = status_record['project_id']
        log.info("Project id = {}".format(project_id))
    except BaseException:
        DatabaseInterface().update_status(status_record_id, BackgroundProcess.FAIL)
        message = "Unexpected failure; status_record_id = {}".format(status_record_id)
        logging.exception(message)
