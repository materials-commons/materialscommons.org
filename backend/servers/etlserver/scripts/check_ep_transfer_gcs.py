#!/usr/bin/env python
import os
import sys
import logging
import time
import argparse
from random import randint

from globus_sdk import (RefreshTokenAuthorizer, TransferClient, TransferAPIError,
                        TransferData)
from ..utils.LoggingHelper import LoggingHelper
from ..common.McdirHelper import McdirHelper
from ..common.MaterialsCommonsGlobusInterface import MaterialsCommonsGlobusInterface
from ..common.GlobusAccess import GlobusAccess, CONFIDENTIAL_CLIENT_APP_AUTH
from ..database.DatabaseInterface import DatabaseInterface


class EpEpTransferHelper:
    def __init__(self, mc_user_id, globus_source_endpoint, source_ep_path, dest_endpoint):
        self.log = logging.getLogger(self.__class__.__name__)
        self.user_id = mc_user_id
        self.source_endpoint = globus_source_endpoint
        self.source_path = source_ep_path

        self.worker_base_path = McdirHelper().get_upload_dir()
        self.mc_interface = MaterialsCommonsGlobusInterface(mc_user_id)
        self.client_user = os.environ.get('MC_CONFIDENTIAL_CLIENT_USER')
        self.client_token = os.environ.get('MC_CONFIDENTIAL_CLIENT_PW')
        self.mc_target_ep_id = dest_endpoint
        self.source_user_globus_id = None
        self.dest_path = ""

        self.globus_access = GlobusAccess(use_implementation=CONFIDENTIAL_CLIENT_APP_AUTH)

    def do_transfer(self):
        self.log.info('Transfer for user_id = {}'.format(self.user_id))
        if (not self.client_user) or (not self.client_token) or (not self.mc_target_ep_id):
            missing = []
            if not self.client_user:
                missing.append('MC_CONFIDENTIAL_CLIENT_USER')
            if not self.client_token:
                missing.append('MC_CONFIDENTIAL_CLIENT_PW')
            if not self.mc_target_ep_id:
                missing.append("MC_CONFIDENTIAL_CLIENT_ENDPOINT")
            message = "Missing environment values: {}".format(", ".join(missing))
            raise EnvironmentError(message)

        self.log.info('Confidential Client, user_id = {}'.format(self.client_user))

        self.dest_path = "/"
        self.log.info("dest_path is {}".format(self.dest_path))

        self.globus_access.activate_endpoint(self.mc_target_ep_id)

        display_name = "Testing create-endpoint for transfer - {}".format(self.user_id)
        data = {
            "DATA_TYPE": "shared_endpoint",
            "host_endpoint": self.mc_target_ep_id,
            "host_path": '/',
            "display_name": display_name,
        }
        endpoint = self.globus_access.create_shared_endpoint(data)


        self.log.info("Getting user authentication information from database...")
        records = DatabaseInterface().get_globus_auth_info_records_by_user_id(self.user_id)
        # Only the latest
        record = (records[0] if len(records) > 0 else None)
        if not record:
            self.log.info("Globus auth info record does not exist; logged out?")
            return

        # else
        self.source_user_globus_id = record['globus_id']
        transfer_tokens = record['tokens']['transfer.api.globus.org']
        # self.log.info("transfer.api.globus.org tokens = {}".format(transfer_tokens))
        self.log.info("got transfer tokens; keys = {}".format(transfer_tokens.keys()))
        user_transfer_client = \
            self.get_user_transfer_client(transfer_tokens, self.source_endpoint)
        if not user_transfer_client:
            message = "Transfer Client for user is not available."
            raise EnvironmentError(message)

        self.log.info("got user transfer client = {}".format(user_transfer_client))

        list = self.globus_access.my_shared_endpoint_list(self.mc_target_ep_id)
        for item in list:
            self.log.info(item.display_name)

        # else
        # transfer_data = TransferData(user_transfer_client=self.user_transfer_client,
        #                              source_endpoint=self.source_endpoint,
        #                              destination_endpoint=self.mc_target_ep_id,
        #                              label='Test-transfer-for-{}'.format(transfer_dir))
        # self.log.info("Object transfer_data = {}".format(transfer_data))
        # transfer_data.add_item(source_path='/',
        #                        destination_path=self.dest_path,
        #                        recursive=True)
        # self.log.info("Object transfer_data = {}".format(transfer_data))
        # self.globus_access.endpoint_autoactivate(self.source_endpoint)
        # self.globus_access.endpoint_autoactivate(self.mc_target_ep_id)

        # ---
        # alternate solution - using a shared endpoint - see below for ACL Rule method
        # ---

        # self.log.info("==== Just prior to add_endpoint_acl_rule ====")
        # self.log.info("|")
        # self.log.info("|  target endpoint = {}".format(self.mc_target_ep_id))
        # self.log.info("|  principal = {} ({})".format(self.source_user_globus_id))
        # self.log.info("|  path = {}".format(self.dest_path))
        # self.log.info("| ")
        # self.log.info("==== ")
        #
        # try:
        #     self.user_transfer_client.add_endpoint_acl_rule(
        #         self.mc_target_ep_id,
        #         dict(principal=self.source_user_globus_id,
        #              principal_type='identity', path=self.dest_path, permissions='rw'),
        #     )
        # except TransferAPIError as error:
        #     # PermissionDenied can happen if a new Portal client is swapped
        #     # in and it doesn't have endpoint manager on the dest_ep.
        #     # The /portal/processed directory has been set to to read/write
        #     # for all users so the subsequent operations will succeed.
        #     if error.code == 'PermissionDenied':
        #         self.log.info(error)
        #     elif error.code != 'Exists':
        #         raise
        #     else:
        #         self.log.info(error)

        # self.log.info("Before submit transfer")
        # results = self.user_transfer_client.submit_transfer(transfer_data)
        # self.log.info("After submit transfer: {}".format(results))
        # task_id = results['task_id']
        # status = "STARTED"
        # while not status == "SUCCEEDED" and not status == "FAILED":
        #     task = self.transfer_client.get_task(task_id)
        #     status = task['status']
        #     self.log.info("Current task status = {}".format(status))
        #     time.sleep(5)
        #
        # try:
        #     acl = next(acl for acl in self.transfer_client.endpoint_acl_list(self.mc_target_ep_id)
        #                if self.dest_path == acl['path'])
        # except StopIteration:
        #     pass
        # except TransferAPIError as ex:
        #     # PermissionDenied can happen if a new Portal client is swapped
        #     # in and it doesn't have endpoint manager on the dest_ep.
        #     # The /portal/processed directory has been set to to writeable
        #     # for all users so the delete task will succeed even if an ACL
        #     # can't be set.
        #     if ex.code == 'PermissionDenied':
        #         pass
        # else:
        #     self.transfer_client.delete_endpoint_acl_rule(self.mc_target_ep_id, acl['id'])

    def get_user_transfer_client(self, transfer_tokens, endpoint_id, endpoint_path='/'):
        self.log.info("Getting transfer client...")
        materials_commons_client = self.mc_interface.get_auth_client()
        authorizer = RefreshTokenAuthorizer(
            transfer_tokens['refresh_token'],
            materials_commons_client,
            access_token=transfer_tokens['access_token'],
            expires_at=transfer_tokens['expires_at_seconds'])

        self.log.info("Got Transfer client authorizer")
        transfer = TransferClient(authorizer=authorizer)

        self.log.info("Gor Transfer client - testing with ls command")
        transfer.endpoint_autoactivate(endpoint_id)
        listing = transfer.operation_ls(endpoint_id, path=endpoint_path)

        file_list = [e for e in listing if e['type'] == 'file']
        self.log.info("File list = {}".format(file_list))

        ep = transfer.get_endpoint(endpoint_id)
        self.log.info("Endpoint - display_name = {}".format(ep['display_name']))
        self.log.info("Endpoint - owner_string = {}".format(ep['owner_string']))

        https_server = ep['https_server']
        endpoint_uri = https_server + endpoint_path if https_server else None
        self.log.info("endpoint_uri = {}".format(endpoint_uri))
        return transfer


def main(mc_user_id, source_endpoint, dest_endpoint):
    log = logging.getLogger("main")
    log.info("Starting: main()")


if __name__ == '__main__':
    LoggingHelper().set_root()
    startup_log = logging.getLogger("main-setup")
    startup_log.info("Starting main-setup")

    argv = sys.argv
    parser = argparse.ArgumentParser(description='Test of Globus non-ETL upload')
    parser.add_argument('-u', '--user_id', type=str, dest="user_id", help="Materials Commons user id; fallback MC_USER_ID env variable; required")
    parser.add_argument('-s', '--source', type=str, dest="source", help="source endpoint; fallback SOURCE_ENDPOINT env var; required")
    parser.add_argument('-p', '--path', type=str, dest="path", help="source path; required")
    parser.add_argument('-d', '--destination', type=str, dest="destination", help="destination endpoint; fallback DESTINATION_ENDPOINT env var; required")
    args = parser.parse_args(argv[1:])

    # user_id
    user_id = None
    if args.user_id:
        user_id = args.user_id
    elif os.environ.get('MC_USER_ID'):
        user_id = os.environ.get('MC_USER_ID')
        startup_log.info("Getting user_id from MC_USER_ID env var = {}".format(user_id))
    else:
        print("You must specify a Materials Commons apikey. Argument not found.")
        parser.print_help()
        exit(-1)

    # users endpoint
    source_endpoint = None
    if args.source:
        source_endpoint = args.source
    elif os.environ.get('SOURCE_ENDPOINT'):
        source_endpoint = os.environ.get('SOURCE_ENDPOINT')
        startup_log.info("Getting source Globus endpoint from SOURCE_ENDPOINT env var = {}".format(source_endpoint))
    else:
        print("You must specify a source endpoint. Argument not found.")
        parser.print_help()
        exit(-1)

    if args.path:
        source_path = args.path
    else:
        print("You must specify a source path. Argument not found.")

    dest_endpoint = None
    if args.destination:
        dest_endpoint = args.destination
    elif os.environ.get('DESTINATION_ENDPOINT'):
        dest_endpoint = os.environ.get('DESTINATION_ENDPOINT')
        startup_log.info("Getting destination Globus endpoint from DESTINATION_ENDPOINT env var = {}".format(dest_endpoint))
    elif os.environ.get('MC_CONFIDENTIAL_CLIENT_ENDPOINT'):
        dest_endpoint = os.environ.get('MC_CONFIDENTIAL_CLIENT_ENDPOINT')
        startup_log.info("Getting destination Globus endpoint from MC_CONFIDENTIAL_CLIENT_ENDPOINT env var = {}".format(dest_endpoint))
    else:
        print("You must specify a destination endpoint. Argument not found.")
        parser.print_help()
        exit(-1)

    startup_log.info("Input parameters:")
    startup_log.info("  Materials Commons user_id = {}".format(user_id))
    startup_log.info("  User source_endpoint = {}".format(source_endpoint))
    startup_log.info("  User source_endpoint path = {}".format(source_path))
    startup_log.info("  Globus Connect Server destination_endpoint = {}".format(dest_endpoint))

    transfer_helper = EpEpTransferHelper(user_id, source_endpoint, source_path, dest_endpoint)
    transfer_helper.do_transfer()
