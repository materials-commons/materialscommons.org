import logging
import sys
import argparse

# from ..common.TestProject import TestProject
from materials_commons.api import get_all_projects
from ..utils.LoggingHelper import LoggingHelper
from ..globus_non_etl_upload.GlobusNonETLUpload import GlobusNonETLUpload


def main(user_id, project_id, globus_endpoint_id, globus_endpoint_path):
    handler = GlobusNonETLUpload(user_id, project_id, globus_endpoint_id, globus_endpoint_path)
    status_record_id = handler.setup()

    handler = GlobusNonETLUpload(user_id, project_id, globus_endpoint_id, globus_endpoint_path)
    verify_status = handler.verify(status_record_id)

    handler = GlobusNonETLUpload(user_id, project_id, globus_endpoint_id, globus_endpoint_path)
    transfer_status = handler.transfer_and_await(status_record_id)


if __name__ == "__main__":
    LoggingHelper().set_root()
    startup_log = logging.getLogger("main-setup")

    argv = sys.argv
    parser = argparse.ArgumentParser(description='Test of Globus non-ETL upload')
    parser.add_argument('--user', type=str, help="Materials Commons user id")
    parser.add_argument('--endpoint', type=str, help="Globus user's endpoint")
    parser.add_argument('--path', type=str, help="Globus users's endpoint path")
    args = parser.parse_args(argv[1:])

    if not args.user:
        print("You must specify a Materials Commons user id. Argument not found.")
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

    # test_project = TestProject(args.apikey).get_project()

    test_project = None
    test_project_name = "Test1"
    project_list = get_all_projects()
    for probe in project_list:
        if probe.name == test_project_name:
            test_project = probe

    if not test_project:
        print("The expected test project ({}) was not found. Please create '{}' owned by {}.".
              format(test_project_name, test_project_name, args.user))
        exit(-1)
    print("Found test project {}({}), owned by '{}'".
        format(test_project.name, test_project.id, test_project.owner))

    if not test_project.owner == args.user:
        print("Test project is not owned by {}. Please fix.").format(args.user)
        exit(-1)

    startup_log.info("args: user = {}".format(args.user))
    startup_log.info("args: endpoint = {}".format(args.endpoint))
    startup_log.info("args: path = {}".format(args.path))
    startup_log.info("test project - name = {}; id = {}".
                     format(test_project.name, test_project.id))

    main(args.user, test_project.id, args.endpoint, args.path)
