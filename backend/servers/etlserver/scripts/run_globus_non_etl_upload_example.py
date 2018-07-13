import logging
import sys
import argparse
import time

from ..common.TestProject import TestProject
from ..globus_non_etl_upload.non_etl_task_library import startup_and_verify
from ..database.BackgroundProcess import BackgroundProcess
from ..database.DatabaseInterface import DatabaseInterface

def main(project, endpoint):
    main_log = logging.getLogger("main")
    main_log.info("Starting all file Globus upload. Project = {} ({})".
                  format(project.name, project.id))
    main_log.info("... Globus endpoint id = {}".format(endpoint))

    results = startup_and_verify(project.owner, project.id, endpoint)

    main_log.info("Startup and verify results = {}".format(results))

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
    parser = argparse.ArgumentParser(description='Test of Globus non-ETL upload')
    parser.add_argument('--endpoint', type=str, help="Globus shared endpoint id")
    args = parser.parse_args(argv[1:])

    if not args.endpoint:
        print("You must specify a globus shared endpoint. Argument not found.")
        parser.print_help()
        exit(-1)

    project = TestProject().get_project()

    startup_log.info("args: endpoint = {}".format(args.endpoint))
    startup_log.info("generated test project - name = {}; id = {}".
                     format(project.name, project.id))

    main(project, args.endpoint)
