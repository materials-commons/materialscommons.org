import argparse
import sys
import logging

from globus_sdk.exc import GlobusAPIError

from materials_commons.api import get_all_projects

from ..download.GlobusDownload import GlobusDownload
from ..common.access_exceptions import RequiredAttributeException
from ..utils.LoggingHelper import LoggingHelper


def main(project, mc_user, apikey):
    main_log = logging.getLogger("main")
    main_log.info("Starting all file Globus upload. Project = {} ({})".
                  format(project.name, project.id))
    try:
        main_log.info("Starting GlobusDownload")
        download = GlobusDownload(mc_user, apikey, project.id)
        url = download.download()
        main_log.info(url)
    except GlobusAPIError as error:
        http_status = error.http_status
        code = error.code
        details = error.message
        message = "Unable to connect to the Globus Connection server (based on configuration information): "
        message += " http_status = " + str(http_status)
        message += ", code = " + code
        message += ", message = " + details
        main_log.error(message)
        return None
    except RequiredAttributeException as missing_attr:
        main_log.exception(missing_attr)
        return None


if __name__ == "__main__":
    LoggingHelper().set_root()
    local_log = logging.getLogger("main-setup")

    argv = sys.argv
    parser = argparse.ArgumentParser(description='Test to transfer from dir of hard links')
    parser.add_argument('--name', type=str, help="Project Name")
    parser.add_argument('--apikey', type=str, help="Materials Commons apikey")
    parser.add_argument('--user', type=str, help="Materials Commons user id")
    args = parser.parse_args(argv[1:])

    if not args.apikey:
        print("You must specify a Materials Commons apikey. Argument not found.")
        parser.print_help()
        exit(-1)

    if not args.user:
        print("You must specify a Materials Commons user id. Argument not found.")
        parser.print_help()
        exit(-1)

    if not args.name:
        print("You must specify a Project name. Argument not found.")
        parser.print_help()
        exit(-1)

    local_log.info("Searching for project with name-match = {}".format(args.name))
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

    local_log.info("Found match with name-match = {}; project.name = {}; id = {}".
                   format(args.name, project_selected.name, project_selected.id))

    main(project_selected, args.user, args.apikey)
