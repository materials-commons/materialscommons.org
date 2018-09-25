#!/usr/bin/env python

import os
from ..utils.LoggingHelper import LoggingHelper
from ..common.GlobusAccess import GlobusAccess, CONFIDENTIAL_CLIENT_APP_AUTH
from globus_sdk import TransferAPIError
import logging
import time
import datetime
import rethinkdb as r
import urllib
import pathlib
import shutil

BASEDIR = "/home/gtarcea/mcdir/mcfs/users"


def load_file(conn, filepath, project):
    print(project)
    pieces = filepath.split('/')
    print("   pieces = {}".format(pieces))
    user = pieces[1]
    id = pieces[2]
    print("  load_file user = {}".format(user))
    print("  id = {}".format(id))
    file_path = pieces[3:]
    print("  file_path = {}".format(file_path))
    datadir = get_datadir(conn, user, project, file_path[:-1])
    create_file(conn, datadir, project, user, file_path)


def get_datadir(conn, user, project, paths):
    created_dir = None
    if len(paths) == 0:
        entries = list(r.table("datadir").get_all([project['id'], project['name']]).run(conn))
        return entries[0]
    else:
        last_dir = None
        for idx, entry in enumerate(paths):
            dir_name = os.path.join(project['name'], *paths[:idx + 1])
            entries = list(r.table("datadir").get_all([project['id'], dir_name]).run(conn))
            if len(entries) == 0:
                created_dir = create_dir(conn, user, last_dir['id'], dir_name, project)
                last_dir = created_dir
            else:
                last_dir = entries[0]
        return created_dir


def create_dir(conn, user, parent, dirpath, project):
    now = r.now()
    ddir = {
        "otype": "datadir",
        "owner": user,
        "project": project['id'],
        "name": dirpath,
        "parent": parent,
        "birthtime": now,
        "mtime": now,
        "atime": now,
        "shortcut": False
    }
    dbobj = r.table("datadirs").insert(ddir, return_changes=True).run(conn)
    datadir = dbobj['changes'][0]['new_val']
    r.table("project2datadir").insert({"project_id": project["id"], "datadir_id": datadir["id"]})
    return datadir


def create_file(conn, datadir, project, user, file_path):
    now = r.now()
    dfile = {
        "otype": "datafile",
        "current": True,
        "description": "",
        "parent": "",
        "usesid": "",
        "birthtime": now,
        "atime": now,
        "mtime": now,
        "name": file_path[-1],
        "owner": user,
        "size": 0
    }

    # Get checksum
    # Get size
    # Get Mime

    # Check if checksum exists, if so set uses id and don't move
    # file into mcdir

    # checksum doesn't exist, move file
    pass


def delete_processed_task_files(path):
    pieces = path.split('/')
    # pieces[1] = materials commons user name
    # pieces[2] = upload id
    path_to_delete = os.path.join(BASEDIR, pieces[1], pieces[2])
    shutil.rmtree(path_to_delete)


def task_path_exists(path):
    pieces = path.split('/')
    # pieces[1] = materials commons user name
    # pieces[2] = upload id
    path_to_check = os.path.join(BASEDIR, pieces[1], pieces[2])
    print("task_path_exists = {}", path_to_check)
    return os.path.exists(path_to_check)


if __name__ == '__main__':
    LoggingHelper().set_root()
    logger = logging.getLogger("main")

    conn = r.connect('localhost', 30815, db='materialscommons')

    # These two lines enable debugging at httplib level (requests->urllib3->http.client)
    # You will see the REQUEST, including HEADERS and DATA, and RESPONSE with HEADERS but without DATA.
    # The only thing missing will be the response.body which is not logged.
    # try:
    #     import http.client as http_client
    # except ImportError:
    #     # Python 2
    #     import httplib as http_client
    # http_client.HTTPConnection.debuglevel = 1
    #
    # # You must initialize logging, otherwise you'll not see debug output.
    # logging.basicConfig()
    # logging.getLogger().setLevel(logging.DEBUG)
    # requests_log = logging.getLogger("requests.packages.urllib3")
    # requests_log.setLevel(logging.DEBUG)
    # requests_log.propagate = True

    globus_access = GlobusAccess(use_implementation=CONFIDENTIAL_CLIENT_APP_AUTH)
    cc_user = os.environ.get('MC_CONFIDENTIAL_CLIENT_USER')
    cc_token = os.environ.get('MC_CONFIDENTIAL_CLIENT_PW')
    cc_transfer_client = globus_access.get_cc_transfer_client()
    target_endpoint = os.environ.get('MC_CONFIDENTIAL_CLIENT_ENDPOINT')
    cc_transfer_client.endpoint_autoactivate(target_endpoint)
    auth_client = globus_access.get_auth_client()
    users = auth_client.get_identities(usernames="glenn.tarcea@gmail.com")
    principal_id = users['identities'][0]['id']
    destination_path = "/glenn.tarcea@gmail.com/"
    # globus id for glenn.tarcea@gmail.com = 32154544-c422-4593-9f94-db9a108eebe0
    acl_rule = dict(principal=principal_id, principal_type="identity",
                    path=destination_path, permissions='rw')
    try:
        cc_transfer_client.add_endpoint_acl_rule(target_endpoint, acl_rule)
    except TransferAPIError as error:
        logger.info(error)
        if error.code == 'PermissionDenied':
            pass
        elif error.code != 'Exists':
            pass

    loop = True
    while loop:
        yesterday = datetime.date.today() - datetime.timedelta(1)
        tasks = cc_transfer_client.endpoint_manager_task_list(num_results=None,
                                                              filter_endpoint=target_endpoint,
                                                              filter_completion_time=yesterday.isoformat(),
                                                              filter_status="SUCCEEDED")
        print("===================== tasks ============================")
        count = 1
        for task in tasks:
            print("{}.-------------------".format(count))
            print('Task ID: {}'.format(task['task_id']))
            print('  Task Owner: {}'.format(task['owner_string']))
            print('  Task Status: {}'.format(task['status']))
            print('  Total Subtasks: {}'.format(task['subtasks_total']))
            print('  Finished Subtasks: {}'.format(task['subtasks_succeeded']))
            print('  Completion Time: {}'.format(task['completion_time']))
            print("-------------------")
            last_dest_path = None
            project = None
            for info in cc_transfer_client.endpoint_manager_task_successful_transfers(task['task_id']):
                print(info)
                p = urllib.parse.unquote(info['destination_path'])
                if not task_path_exists(p):
                    break
                last_dest_path = p
                print("    File to process: {}".format(p))
                if project is None:
                    pieces = p.split('/')
                    id = pieces[2]
                    print(" id = {}".format(id))
                    items = list(r.table("globus_uploads").get_all(id).eq_join("project_id", r.table("projects")).zip().run(conn))
                    project = items[0]
                load_file(conn, p, project)
            if last_dest_path:
                delete_processed_task_files(p)
            # load_files(conn, task['owner_string'])
            count = count + 1
        time.sleep(10)
