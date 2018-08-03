import logging
import sys
import argparse
import time

from ..common.TestProject import TestProject
from ..globus_non_etl_upload.non_etl_task_library import startup_and_verify
from ..database.BackgroundProcess import BackgroundProcess
from ..database.DatabaseInterface import DatabaseInterface
from ..utils.LoggingHelper import LoggingHelper


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
    LoggingHelper().set_root()
    startup_log = logging.getLogger("main-setup")

    argv = sys.argv
    parser = argparse.ArgumentParser(description='Test of Globus non-ETL upload')
    parser.add_argument('--endpoint', type=str, help="Globus shared endpoint id")
    parser.add_argument('--apikey', type=str, help="A Materials Commons apikey")
    args = parser.parse_args(argv[1:])

    if not args.endpoint:
        print("You must specify a globus shared endpoint. Argument not found.")
        parser.print_help()
        exit(-1)

    if not args.apikey:
        print("You must specify a Materials Commons apikey. Argument not found.")
        parser.print_help()
        exit(-1)

    test_project = TestProject(args.apikey).get_project()

    startup_log.info("args: endpoint = {}".format(args.endpoint))
    startup_log.info("generated test project - name = {}; id = {}".
                     format(test_project.name, test_project.id))

    main(test_project, args.endpoint)
