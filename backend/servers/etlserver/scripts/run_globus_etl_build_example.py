import sys
import time
import logging
import argparse

from materials_commons.api import get_all_projects

from ..database.BackgroundProcess import BackgroundProcess
from ..database.DatabaseInterface import DatabaseInterface


def main(project_id, globus_endpoint):
    from ..globus_etl.task_library import startup_and_verify
    log = logging.getLogger("top_level_run_ELT_example")

    user_id = "test@test.mc"
    experiment_name = "Test from excel"
    experiment_description = "An experiment built via etl from test data"
    excel_file_path = "workflow.xlsx"
    data_dir_path = "data"

    log.info("user_id = " + user_id)
    log.info("project_id = " + project_id)
    log.info("experiment_name = " + experiment_name)
    log.info("experiment_description = " + experiment_description)
    log.info("globus_endpoint = " + globus_endpoint)
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
    root = logging.getLogger()
    root.setLevel(logging.INFO)

    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(name)s - %(lineno)s - %(message)s')
    ch.setFormatter(formatter)
    root.addHandler(ch)

    local_log = logging.getLogger("main-setup")

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
    parser.add_argument('--name', type=str, help="Project Name")
    parser.add_argument('--endpoint', type=str, help="Globus Endpoint")
    args = parser.parse_args(argv[1:])

    if not args.name:
        print("You must specify a unique project name, or name substring. Argument not found.")
        parser.print_help()
        exit(-1)

    if not args.endpoint:
        print("You must specify a globus shared endpoint. Argument not found.")
        parser.print_help()
        exit(-1)

    local_log.info("Project name = {}; Globus Endpoint = {}".format(args.name, args.endpoint))

    local_log.info("Searching for project with name-match = {}".format(args.name))
    project_list = get_all_projects()

    project_selected = None
    for probe in project_list:
        if args.name in probe.name:
            if project_selected:
                print("Found multiple matches for {}".format(args.name))
                print("You must specify a unique project name, or name substring.")
                parser.print_help()
                exit(-1)
            project_selected = probe

    if not project_selected:
        print("Found no matches for {}".format(args.name))
        print("You must specify a unique project name, or name substring.")
        parser.print_help()
        exit(-1)

    local_log.info("Found match with name-match = {}; project.name = {}; id = {}".
                   format(args.name, project_selected.name, project_selected.id))

    main(project_selected.id, args.endpoint)
