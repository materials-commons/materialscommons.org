import os
import sys
import argparse
import time
from random import randint
from shutil import copy
from globus_sdk.exc import GlobusAPIError

from materials_commons.api import get_all_projects
from ..common.MaterialsCommonsGlobusInterface import MaterialsCommonsGlobusInterface
from ..common.GlobusInfo import GlobusInfo
from ..common.GlobusAccess import GlobusAccess
from ..globus_non_etl_upload.non_etl_task_library import startup_and_verify
from ..database.BackgroundProcess import BackgroundProcess
from ..database.DatabaseInterface import DatabaseInterface
from ..download.GlobusDownload import GlobusDownload


def fake_name(prefix):
    number = "%05d" % randint(0, 99999)
    return prefix + number


def main(project, mc_apikey, globus_user_id, globus_endpoint_id):
    env_list = ['MCDIR', 'MCDB_PORT', 'MC_CONFIDENTIAL_CLIENT_USER', 'MC_CONFIDENTIAL_CLIENT_PW',
                'MC_CONFIDENTIAL_CLIENT_ENDPOINT', 'MC_DOWNLOAD_ENDPOINT_ID', 'MC_API_URL']

    print("")
    env_values = {}
    missing = []
    for env_name in env_list:
        env_value = os.environ.get(env_name)
        env_values[env_name] = env_value
        if not env_value:
            missing.append(env_name)
    if missing:
        message = "Missing environment values: {}".format(", ".join(missing))
        print(message)
        exit(-1)
    print("Environment variables:")
    for key in env_values:
        print("  {} = {}".format(key, env_values[key]))
    mc_input_staging_ep_id = os.environ.get('MC_CONFIDENTIAL_CLIENT_ENDPOINT')
    mc_output_staging_ep_id = os.environ.get('MC_DOWNLOAD_ENDPOINT_ID')

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

        transfer_client = interface.get_transfer_interface(interface.get_auth_client())

        print("")
        print("Check access to endpoints...")
        ep = transfer_client.get_endpoint(globus_endpoint_id)
        print("  user download endpoint: {} -- {}".format(ep['display_name'], ep['id']))
        ep = transfer_client.get_endpoint(mc_input_staging_ep_id)
        print("  mc client input/upload staging endpoint: {} -- {}".format(ep['display_name'], ep['id']))
        ep = transfer_client.get_endpoint(mc_output_staging_ep_id)
        print("  mc client output/download staging endpoint: {} -- {}".format(ep['display_name'], ep['id']))

        print("Check access to globus user...")
        access = GlobusAccess()
        globus_user = access.get_globus_user(globus_user_id)
        if not globus_user:
            print("  Can not find globus user for {}".format(globus_user_id))
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
    try:

        print("  Upload to Materials Commons...")

        results = startup_and_verify(project.owner, project.id, globus_endpoint_id)

        print("  Startup and verify results = {}".format(results))

        if not results['status'] == "SUCCESS":
            print("  Setup failed.")
            exit(-1)

        tracking_id = results['status_record_id']
        status = BackgroundProcess.INITIALIZATION
        while (not status == BackgroundProcess.SUCCESS) and (not status == BackgroundProcess.FAIL):
            status_record = DatabaseInterface().get_status_record(tracking_id)
            status = status_record['status']
            queue = status_record['queue']
            print("  Status = {}; Queue = {}".format(status, queue))
            time.sleep(5)

        if status == "Success":
            print("  Completed transfer to project '{}' - {}".format(project.name, project.id))
        else:
            print("  Failed in transfer to project '{}' - {}".format(project.name, project.id))
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

    try:
        print("Download from Materials Commons...")

        download = GlobusDownload(project.id, globus_user_id, mc_apikey)
        url = download.download()
        print(url)

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
    argv = sys.argv
    parser = argparse.ArgumentParser(description='Test of configuration of Materials Commons Globus interface')
    parser.add_argument('--name', type=str,
                        help="A unique name for a Materials Commons Project.")
    parser.add_argument('--userid', type=str,
                        help="A Globus user id/name - for download testing")
    parser.add_argument('--endpoint', type=str,
                        help="A Globus source endpoint that is shared with transfer client - for upload testing")
    parser.add_argument('--apikey', type=str,
                        help="Materials Commons apikey, the owner of the project")
    args = parser.parse_args(argv[1:])

    args_probe_list = ['name', 'userid', 'endpoint', 'apikey']
    args_probe_missing = []
    for args_probe in args_probe_list:
        if not getattr(args, args_probe):
            args_probe_missing.append(args_probe)
    if args_probe_missing:
        plural = "s"
        if len(args_probe_missing) == 1:
            plural = ""
        print("\nMissing the following input argument{}: {}\n".
              format(plural,", ".join(args_probe_missing)))
        parser.print_help()
        exit(-1)

    print("Check of input args: ok")
    for args_probe in args_probe_list:
        value = getattr(args, args_probe)
        print("  --{} = {}".format(args_probe, value))

    print("")
    print("Searching for project with name-match = {}".format(args.name))
    project_list = get_all_projects(apikey=args.apikey)

    project_selected = None
    for probe in project_list:
        if args.name == probe.name:
            project_selected = probe
            break

    if not project_selected:
        print("Found no matches for {}".format(args.name))
        print("You must specify a existing project name.")
        parser.print_help()
        exit(-1)

    print("Found matching project for query name = {}; project.name = {}; id = {}; owner = {}".
                   format(args.name, project_selected.name, project_selected.id, project_selected.owner))

    print("Additional test values: ")
    print("   globus user name   = {}".format(args.userid))
    print("   globus endpoint id = {}".format(args.endpoint))

    main(project_selected, args.apikey, args.userid, args.endpoint)
