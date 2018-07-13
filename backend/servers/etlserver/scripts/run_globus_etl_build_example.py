import sys
import time
import logging
import argparse

from ..common.TestProject import TestProject
from ..database.BackgroundProcess import BackgroundProcess
from ..database.DatabaseInterface import DatabaseInterface


def main(project, globus_endpoint, excel_file_path, data_dir_path):
    from ..globus_etl.task_library import startup_and_verify
    main_log = logging.getLogger("top_level_run_ELT_example")

    user_id = "test@test.mc"
    experiment_name = "Test from excel"
    experiment_description = "An experiment built via etl from test data"

    main_log.info("user_id = " + user_id)
    main_log.info("project = '{}' ({})".format(project.name, project.id))
    main_log.info("experiment_name = " + experiment_name)
    main_log.info("experiment_description = " + experiment_description)
    main_log.info("globus_endpoint = " + globus_endpoint)
    main_log.info("excel_file_path = " + excel_file_path)
    main_log.info("data_dir_path = " + data_dir_path)

    results = startup_and_verify(user_id, project.id, experiment_name, experiment_description,
                                 globus_endpoint, excel_file_path, data_dir_path)

    if not results['status'] == "SUCCESS":
        main_log.error("Setup failed.")
        return

    tracking_id = results['status_record_id']
    status = BackgroundProcess.INITIALIZATION
    while (not status == BackgroundProcess.SUCCESS) and (not status == BackgroundProcess.FAIL):
        status_record = DatabaseInterface().get_status_record(tracking_id)
        status = status_record['status']
        queue = status_record['queue']
        main_log.info("Status = {}; Queue = {}".format(status, queue))
        time.sleep(2)

    if status == "Success":
        main_log.info("Completed transfer to project '{}'".format(project.name))
    else:
        main_log.info("Failed in transfer to project '{}'".format(project.name))


if __name__ == "__main__":
    root = logging.getLogger()
    root.setLevel(logging.INFO)

    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(name)s - %(lineno)s - %(message)s')
    ch.setFormatter(formatter)
    root.addHandler(ch)

    startup_log = logging.getLogger("main-setup")

    # suppress info logging for globus_sdk loggers that are invoked, while leaving my info logging in place
    logger_list = ['globus_sdk.authorizers.basic', 'globus_sdk.authorizers.client_credentials',
                   'globus_sdk.authorizers.renewing', 'globus_sdk.transfer.client.TransferClient',
                   'globus_sdk.transfer.paging', 'globus_sdk.config', 'globus_sdk.exc',
                   'globus_sdk.transfer.data', 'globus_sdk.auth', 'globus_sdk.authorizers',
                   'globus_sdk.auth.client_types.confidential_client.ConfidentialAppAuthClient',
                   'urllib3.connectionpool']
    for name in logger_list:
        logging.getLogger(name).setLevel(logging.ERROR)

    argv = sys.argv
    parser = argparse.ArgumentParser(
        description='Run the Globus/ETL process with test data - in a predefined test endpoint')
    parser.add_argument('--endpoint', type=str, help="Globus Endpoint")
    parser.add_argument('--input', type=str, help="Input Spreadsheet File (path relative to endpoint)")
    parser.add_argument('--data', type=str, help="Data Directory (path relative to endpoint)")
    args = parser.parse_args(argv[1:])

    if not args.endpoint:
        print("You must specify a globus shared endpoint. Argument not found.")
        parser.print_help()
        exit(-1)

    if not args.input:
        print("You must specify the path for the spreadsheet file (relative to the endpoint). Argument not found.")
        parser.print_help()
        exit(-1)

    if not args.endpoint:
        print("You must specify the path for the data directory (relative to the endpoint). Argument not found.")
        parser.print_help()
        exit(-1)

    generated_project = TestProject().get_project()

    startup_log.info("args: endpoint = {}; input = {}; data={}"
                     .format(args.endpoint, args.input, args.data))
    startup_log.info("generated test project - name = {}; id = {}".
                     format(generated_project.name, generated_project.id))

    main(generated_project, args.endpoint, args.input, args.data)
