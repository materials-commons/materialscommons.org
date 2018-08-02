import os
import logging
import sys
import argparse
from materials_commons.api import get_all_projects
from ..common.MaterialsCommonsGlobusInterface import MaterialsCommonsGlobusInterface
from ..common.GlobusInfo import GlobusInfo
from globus_sdk.exc import GlobusAPIError


def main(project, globus_user_id, globus_endpoint_id, datadir):

    mcdir = os.environ.get('MCDIR')
    mcdb_port = os.environ.get('MCDB_PORT')
    client_user = os.environ.get('MC_CONFIDENTIAL_CLIENT_USER')
    client_token = os.environ.get('MC_CONFIDENTIAL_CLIENT_PW')
    mc_target_upload_ep_id = os.environ.get('MC_CONFIDENTIAL_CLIENT_ENDPOINT')
    mc_target_download_ep_id = os.environ.get('MC_DOWNLOAD_ENDPOINT_ID')

    if (not mcdir) or (not mcdb_port) \
            or (not client_user) or (not client_token) \
            or (not mc_target_upload_ep_id) or (not mc_target_download_ep_id):
        missing = []
        if not mcdir:
            missing.append('MCDIR')
        if not mcdb_port:
            missing.append('MCDB_PORT')
        if not client_user:
            missing.append('MC_CONFIDENTIAL_CLIENT_USER')
        if not client_token:
            missing.append('MC_CONFIDENTIAL_CLIENT_PW')
        if not mc_target_upload_ep_id:
            missing.append("MC_CONFIDENTIAL_CLIENT_ENDPOINT")
        if not mc_target_download_ep_id:
            missing.append("MC_DOWNLOAD_ENDPOINT_ID")
        message = "Missing environment values: {}".format(", ".join(missing))
        print(message)
        exit(-1)

    interface = MaterialsCommonsGlobusInterface("does-not-matter")
    try:
        interface.set_transfer_client()
    except GlobusAPIError as e:
        http_status = e.http_status
        code = e.code
        details = e.message
        message = "Unable to connect to the Globus Connection server (based on configuration information): "
        message += " http_status = " + str(http_status)
        message += ", code = " + code
        message += ", message = " + details
        print(message)
        exit(-1)

    try:
        source = GlobusInfo()
        returned_info = source.get_all()
        print("\nBasic Globus Information:")
        for key in returned_info:
            print("Details from info: {} = {}". format(key, returned_info[key]))
    except GlobusAPIError as e1:
        http_status = e1.http_status
        code = e1.code
        details = e1.message
        message = "Unable to connect to the Globus Connection server (based on configuration information): "
        message += " http_status = " + str(http_status)
        message += ", code = " + code
        message += ", message = " + details
        print(message)
        exit(-1)

    print("")
    exit(0)


if __name__ == "__main__":
    root = logging.getLogger()
    root.setLevel(logging.INFO)

    ch = logging.StreamHandler(sys.stdout)
    # ch.setLevel(logging.DEBUG)
    ch.setLevel(logging.WARNING)
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
    parser = argparse.ArgumentParser(description='Test of configuration of Materials Commons Globus interface')
    parser.add_argument('--name', type=str, help="The unique name of a Materials Commons Project. Partial name ok.")
    parser.add_argument('--userid', type=str, help="A Globus user id/name - for download testing")
    parser.add_argument('--endpoint', type=str, help="A Globus source endpoint that is shared transfer client - for upload testing")
    parser.add_argument('--apikey', type=str, help="Materials Commons apikey, the owner of the project")
    parser.add_argument('--testdata', type=str, help="The path to a directory with a single small file for transfer testing")
    args = parser.parse_args(argv[1:])

    local_log.info("Searching for project with name-match = {}".format(args.name))
    project_list = get_all_projects(apikey=args.apikey)

    datadir = None
    try:
        datadir = os.path.abspath(args.testdata)
        if not os.path.isdir(datadir):
            print("The given path is not a directory = {}".format(datadir))
            datadir = None
    except TypeError:
        print("Coould not convert into path; test data = {}".format(args.testdata))
        datadir = None

    if not datadir:
        parser.print_help()
        exit(-1)

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

    local_log.info("Found matching project for query name = {}; project.name = {}; id = {}; owner = {}".
                   format(args.name, project_selected.name, project_selected.id, project_selected.owner))

    local_log.info("Additional test values: ")
    local_log.info("   globus user name   = {}".format(args.name))
    local_log.info("   globus endpoint id = {}".format(args.endpoint))
    local_log.info("   globus user name = {}".format(datadir))

    main(project_selected, args.name, args.endpoint, datadir)
