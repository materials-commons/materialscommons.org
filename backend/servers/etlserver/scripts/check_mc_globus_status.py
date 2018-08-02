import os
import logging
import sys
import argparse
from random import randint
from materials_commons.api import get_all_projects
from ..common.MaterialsCommonsGlobusInterface import MaterialsCommonsGlobusInterface
from ..common.GlobusInfo import GlobusInfo
from ..common.McdirHelper import McdirHelper
from globus_sdk.exc import GlobusAPIError


def fake_name(prefix):
    number = "%05d" % randint(0, 99999)
    return prefix + number


def main(project, globus_user_id, globus_endpoint_id, local_endpoint_dir, test_file_path):

    env_list = ['MCDIR', 'MCDB_PORT', 'MC_CONFIDENTIAL_CLIENT_USER', 'MC_CONFIDENTIAL_CLIENT_PW',
                'MC_CONFIDENTIAL_CLIENT_ENDPOINT', 'MC_DOWNLOAD_ENDPOINT_ID', 'MC_API_URL']

    print("")
    env_values = {}
    missing = []
    for env_name in env_list:
        value = os.environ.get(env_name)
        env_values[env_name] = value
        if not value:
            missing.append(env_name)
    if missing:
        message = "Missing environment values: {}".format(", ".join(missing))
        print(message)
        exit(-1)
    print("Environment variables:")
    for key in env_values:
        print("  {} = {}".format(key, env_values[key]))

    print("")
    try:
        source = GlobusInfo()
        returned_info = source.get_all()
        print("Basic Globus Information:")
        for key in returned_info:
            print("  Details from info: {} = {}". format(key, returned_info[key]))
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
    interface = MaterialsCommonsGlobusInterface(project.owner)
    try:
        status = interface.set_transfer_client()
        if status['status'] == 'ok':
            print("Globus Transfer client is available; checks: " +
                  "MC_CONFIDENTIAL_CLIENT_USER, and MC_CONFIDENTIAL_CLIENT_PW")
        else:
            print("Some problem with creating the Globus Transfer Client!")
            exit(-1)
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

    print("")
    print("Testing upload...")
    print("  Copy test file to local endpoint dir")
    # get file and type
    # copy and rename file
    # 
    try:
        pass
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
    parser.add_argument('--name', type=str,
                        help="The unique name of a Materials Commons Project. Partial name ok.")
    parser.add_argument('--userid', type=str,
                        help="A Globus user id/name - for download testing")
    parser.add_argument('--endpoint', type=str,
                        help="A Globus source endpoint that is shared with transfer client - for upload testing")
    parser.add_argument('--localdir', type=str,
                        help="The path to the directory of --endpoint")
    parser.add_argument('--apikey', type=str,
                        help="Materials Commons apikey, the owner of the project")
    parser.add_argument('--testdata', type=str,
                        help="The path to a directory with a single small file for transfer testing")
    args = parser.parse_args(argv[1:])

    local_log.info("Searching for project with name-match = {}".format(args.name))
    project_list = get_all_projects(apikey=args.apikey)

    datadir = None
    try:
        datadir = os.path.abspath(args.testdata)
        if not os.path.isdir(datadir):
            print("The given path for --testdata is not a directory = {}".format(datadir))
            datadir = None
    except TypeError:
        print("Could not convert into path; test data = {}".format(args.testdata))
        datadir = None

    if not datadir:
        parser.print_help()
        exit(-1)

    local_endpoint_path = None
    try:
        local_endpoint_path = os.path.abspath(args.localdir)
        if not os.path.isdir(local_endpoint_path):
            print("The given path for --localdir is not a directory = {}".format(local_endpoint_path))
            local_endpoint_path = None
    except TypeError:
        print("Could not convert into path; test data = {}".format(args.localdir))
        local_endpoint_path = None

    if not local_endpoint_path:
        parser.print_help()
        exit(-1)

    datafile_path = None
    content = os.listdir(datadir)
    for entry in content:
        if os.path.isfile(os.path.join(datadir, entry)):
            datafile_path = os.path.join(datadir, entry)
            break
    if not datafile_path:
        print("Could not find a file in the datadir: {}".format(datadir))
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
    local_log.info("   local path to globus endpoint = {}".format(args.localdir))
    local_log.info("   path to test file = {}".format(datafile_path))

    main(project_selected, args.name, args.endpoint, local_endpoint_path, datafile_path)
