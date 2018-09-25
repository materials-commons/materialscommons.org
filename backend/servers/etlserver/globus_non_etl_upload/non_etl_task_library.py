import logging
import os

from ..database.DatabaseInterface import DatabaseInterface
from ..database.BackgroundProcess import BackgroundProcess

from .GlobusMCUploadPrepare import GlobusMCUploadPrepare
from .GlobusMCTransfer import GlobusMCTransfer


def non_etl_startup_and_verify(user_id, project_id, user_globus_endpoint, user_globus_path):
    log = logging.getLogger(__name__ + ".non_etl_startup_and_verify")
    log.info("Starting non-etl startup_and_verify")

    status_record_id = None
    # noinspection PyBroadException
    try:
        handler = GlobusMCUploadPrepare(user_id)
        status_record_id = handler.setup(project_id, user_globus_endpoint, user_globus_path)
        verify_status = handler.verify(status_record_id)
    except BaseException:
        message = "Unexpected failure; status_record_id = None"
        if status_record_id:
            message = "Unexpected failure; status_record_id = {}".format(status_record_id)
        DatabaseInterface().update_status(status_record_id, BackgroundProcess.FAIL)
        logging.exception(message)
        return {"status": "FAIL"}

    if not verify_status['status'] == "SUCCESS":
        log.error("Failed to verify setup; status_record_id = {}".format(status_record_id))
        DatabaseInterface().update_status(status_record_id, BackgroundProcess.FAIL)
        return verify_status

    log.info("setup and verify_setup passed - setting up factory task")

    from ..faktory.TaskChain import FILE_UPLOAD_QUEUE
    DatabaseInterface().update_queue(status_record_id, FILE_UPLOAD_QUEUE)
    DatabaseInterface().update_status(status_record_id, BackgroundProcess.SUBMITTED_TO_QUEUE)
    log.info("updated status record queue to {} and status to {}"
             .format(FILE_UPLOAD_QUEUE, BackgroundProcess.SUBMITTED_TO_QUEUE))
    from ..faktory.TaskChain import TaskChain
    task_chain = TaskChain()
    task_chain.start_non_etl_chain(status_record_id)
    log.info("Called task_chain.start_non_etl_chain")

    verify_status['status_record_id'] = status_record_id
    return verify_status


def non_etl_globus_upload(status_record_id):
    # noinspection PyBroadException
    try:
        from ..faktory.TaskChain import FILE_PROCESS_QUEUE
        log = logging.getLogger(__name__ + ".non_elt_globus_upload")
        log.info("Starting non_elt_globus_upload with status_record_id{}".format(status_record_id))
        record = DatabaseInterface().update_status(status_record_id, BackgroundProcess.RUNNING)

        handler = GlobusMCTransfer(record['owner'])
        results = handler.transfer_and_await(status_record_id)

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
        project_id = status_record['project_id']

        transfer_base_path = status_record['extras']['transfer_base_path']

        project = DatabaseInterface().get_project(project_id)
        log.info("working with project '{}' ({})".format(project['name'], project_id))

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
