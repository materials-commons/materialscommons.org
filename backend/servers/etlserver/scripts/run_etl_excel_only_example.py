import sys
import time
import logging
import argparse

from ..database.BackgroundProcess import BackgroundProcess
from ..database.DatabaseInterface import DatabaseInterface
from ..utils.LoggingHelper import LoggingHelper


def main(project_id):
    from ..globus_etl_upload.etl_task_library import startup_and_verify
    log = logging.getLogger("top_level_run_ELT_example")

    user_id = "test@test.mc"
    experiment_name = "Test from excel"
    experiment_description = "An experiment built via etl from test data"
    globus_endpoint = "067ce67a-3bf1-11e8-b9b5-0ac6873fc732"
    request_uuid = project_id
    excel_file_path = "/dataForTest/input.xlsx"
    data_dir_path = "/dataForTest/data"

    log.info("user_id = " + user_id)
    log.info("project_id = " + project_id)
    log.info("experiment_name = " + experiment_name)
    log.info("experiment_description = " + experiment_description)
    log.info("globus_endpoint = " + globus_endpoint)
    log.info("request_uuid = " + request_uuid)
    log.info("excel_file_path = " + excel_file_path)
    log.info("data_dir_path = " + data_dir_path)

    results = startup_and_verify(user_id, project_id, experiment_name, experiment_description,
                                 globus_endpoint, excel_file_path, data_dir_path)

    if not results['status'] == "SUCCESS":
        log.error("Setup failed.")
        return

    tracking_id = results['status_record_id']
    status = BackgroundProcess.INITIALIZATION
    while (not status == BackgroundProcess.SUCCESS) and (not status == BackgroundProcess.FAIL):
        status_record = DatabaseInterface().get_status_record(tracking_id)
        status = status_record['status']
        queue = status_record['queue']
        log.info("Status = {}; Queue = {}".format(status, queue))
        time.sleep(2)


if __name__ == "__main__":
    LoggingHelper().set_root(logging.DEBUG)

    argv = sys.argv
    parser = argparse.ArgumentParser(
        description='Run the Globus/ETL process with test data - in a predefined test endpoint')
    parser.add_argument('project_id', type=str, help="Project ID")
    # parser.add_argument('file_path', type=str, help="Excel File Path")
    args = parser.parse_args(argv[1:])
    project_id_in = args.project_id
    # excel_file_path_in = args.file_path

    main(project_id_in)
