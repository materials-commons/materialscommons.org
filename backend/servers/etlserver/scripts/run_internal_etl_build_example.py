import sys
import logging
import argparse

from materials_commons.api import get_all_projects

from ..utils.LoggingHelper import LoggingHelper
from ..internal_etl.MCInternalBuildProjectExperimentFromETL import MCInternalBuiltProjectExperimentFromELT
from ..internal_etl.MCInternalETLPrepare import MCInternalETLPrepare


def main(project, user_id, excel_file_path, data_dir_path):
    main_log = logging.getLogger("main")

    experiment_name = "Test from excel"
    experiment_description = "An experiment built via etl from test data"

    main_log.info("user_id = {}".format(user_id))
    main_log.info("project = '{}' ({})".format(project.name, project.id))
    main_log.info("experiment_name = {}".format(experiment_name))
    main_log.info("experiment_description = {}".format(experiment_description))
    main_log.info("excel_file_path = {}".format(excel_file_path))
    main_log.info("data_dir_path = {}".format(data_dir_path))

    main_log.info("Starting setup")
    handler = MCInternalETLPrepare(user_id)
    status_record_id = handler.setup_etl(project.id, experiment_name, experiment_description,
                                         excel_file_path, data_dir_path)
    main_log.info("Starting verify")
    verify_status = handler.verify(status_record_id)
    main_log.info("Verify status = {}".format(verify_status))

    if not verify_status['status'] == 'SUCCESS':
        main_log.info("Aborting Transfer and ELT because of verify failure(s) = {}".format(verify_status))
        exit(-1)

    handler = MCInternalBuiltProjectExperimentFromELT()
    main_log.info("Starting ETL")
    etl_status = handler.build_experiment(status_record_id)
    main_log.info("ETL status = {}".format(etl_status))


if __name__ == "__main__":
    LoggingHelper().set_root()
    startup_log = logging.getLogger("main-setup")

    argv = sys.argv
    parser = argparse.ArgumentParser(
        description='Run the ETL process with test data as loaded into a give project')
    parser.add_argument('--user', type=str, help="Materials Commons user id")
    parser.add_argument('--apikey', type=str, help="Materials Commons user's apikey")
    parser.add_argument('--name', type=str, help="Name of project")
    parser.add_argument('--input', type=str, help="Input Spreadsheet File (path relative to project)")
    parser.add_argument('--data', type=str, help="Data Directory (path relative to project)")
    args = parser.parse_args(argv[1:])

    if not args.user:
        print("You must specify Materials Commons user id. Argument not found.")
        parser.print_help()
        exit(-1)

    if not args.apikey:
        print("You must specify the user's apikey. Argument not found.")
        parser.print_help()
        exit(-1)

    if not args.name:
        print("You must specify the name of the project containing the spreadsheet and data. Argument not found.")
        parser.print_help()
        exit(-1)

    if not args.input:
        print("You must specify the path for the spreadsheet file (relative to the base path). Argument not found.")
        parser.print_help()
        exit(-1)

    if not args.data:
        print("You must specify the path for the data directory (relative to the base path). Argument not found.")
        parser.print_help()
        exit(-1)

    startup_log.info("Searching for project with name-match = {}".format(args.name))
    project_list = get_all_projects(apikey=args.apikey)

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

    startup_log.info("Found match with name-match = {}; project.name = {}; id = {}".
                   format(args.name, project_selected.name, project_selected.id))

    main(project_selected, args.user, args.input, args.data)
