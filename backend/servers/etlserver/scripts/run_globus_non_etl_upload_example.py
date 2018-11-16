import logging
import sys
import argparse

from ..utils.LoggingHelper import LoggingHelper
from ..common.TestProject import TestProject
from ..globus.GlobusMCUploadPrepare import GlobusMCUploadPrepare
from ..globus.GlobusMCTransfer import GlobusMCTransfer
from ..globus.GlobusMCLoadAndTransform import GlobusMCLoadAndTransform


def main(user_id, project_id, globus_endpoint_id, globus_endpoint_path):
    main_log = logging.getLogger("main")
    handler = GlobusMCUploadPrepare(user_id)
    main_log.info("Starting setup")
    status_record_id = handler.setup_non_etl(project_id, globus_endpoint_id, globus_endpoint_path)
    main_log.info("Starting verify")
    verify_status = handler.verify(status_record_id)
    main_log.info("Verify status = {}".format(verify_status))

    if not verify_status['status'] == 'SUCCESS':
        handler.cleanup_on_error()
        main_log.info("Aborting Transfer test because of verify failure(s) = {}".format(verify_status))
        exit(-1)

    handler = GlobusMCTransfer(user_id)
    main_log.info("Starting transfer")
    transfer_status = handler.transfer_and_await(status_record_id)
    main_log.info("Transfer status = {}".format(transfer_status))

    handler = GlobusMCLoadAndTransform()
    main_log.info("Starting file transform into MC")
    transform_status = handler.load_source_directory_into_project(status_record_id)
    main_log.info("File transform status = {}".format(transform_status))

if __name__ == "__main__":
    LoggingHelper().set_root()
    startup_log = logging.getLogger("main-setup")

    argv = sys.argv
    parser = argparse.ArgumentParser(description='Test of Globus non-ETL upload')
    parser.add_argument('--user', type=str, help="Materials Commons user id")
    parser.add_argument('--apikey', type=str, help="MC user's API key (used to create test project)")
    parser.add_argument('--endpoint', type=str, help="Globus user's endpoint")
    parser.add_argument('--path', type=str, help="Globus users's endpoint path")
    args = parser.parse_args(argv[1:])

    if not args.user:
        print("You must specify a Materials Commons user id. Argument not found.")
        parser.print_help()
        exit(-1)

    if not args.apikey:
        print("You must specify a the Materials Commons user's APIKEY. Argument not found.")
        parser.print_help()
        exit(-1)

    if not args.endpoint:
        print("You must specify a Globus user's endpoint. Argument not found.")
        parser.print_help()
        exit(-1)

    if not args.path:
        print("You must specify a Globus users's endpoint path. Argument not found.")
        parser.print_help()
        exit(-1)

    test_project = TestProject(args.apikey).get_project()

    if not test_project.owner == args.user:
        print("Test project is not owned by {}. Please fix.").format(args.user)
        exit(-1)

    startup_log.info("args: user = {}".format(args.user))
    startup_log.info("args: endpoint = {}".format(args.endpoint))
    startup_log.info("args: path = {}".format(args.path))
    startup_log.info("test project - name = {}; id = {}".
                     format(test_project.name, test_project.id))

    main(args.user, test_project.id, args.endpoint, args.path)
    startup_log.info("Finished: test project - name = {}; id = {}".
                     format(test_project.name, test_project.id))
