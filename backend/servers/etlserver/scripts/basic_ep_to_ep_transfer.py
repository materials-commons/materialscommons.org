#!/usr/bin/env python
import os
import sys
import logging
# import time
import argparse
# from random import randint

from globus_sdk import (RefreshTokenAuthorizer, TransferClient, TransferAPIError,
                        TransferData)
from ..utils.LoggingHelper import LoggingHelper
from ..database.DatabaseInterface import DatabaseInterface
from ..common.GlobusAccess import GlobusAccess, CONFIDENTIAL_CLIENT_APP_AUTH

DESTINATION_BASE_PATH = '/mcdir/landing_for_test/'


class EpEpTransferHelper:
    def __init__(self, mc_user_id, globus_users_source_endpoint, globus_users_source_path, dest_endpoint):
        self.log = logging.getLogger(self.__class__.__name__)
        self.user_id = mc_user_id
        self.source_endpoint = globus_users_source_endpoint
        self.source_path = globus_users_source_path

        self.globus_access = GlobusAccess(use_implementation=CONFIDENTIAL_CLIENT_APP_AUTH)

        self.client_user = os.environ.get('MC_CONFIDENTIAL_CLIENT_USER')
        self.client_token = os.environ.get('MC_CONFIDENTIAL_CLIENT_PW')
        self.target_endpoint = dest_endpoint
        self.source_user_globus_id = None

    def do_transfer(self):
        self.log.info('Transfer for user_id = {}'.format(self.user_id))
        if (not self.client_user) or (not self.client_token) or (not self.target_endpoint):
            missing = []
            if not self.client_user:
                missing.append('MC_CONFIDENTIAL_CLIENT_USER')
            if not self.client_token:
                missing.append('MC_CONFIDENTIAL_CLIENT_PW')
            if not self.target_endpoint:
                missing.append("MC_CONFIDENTIAL_CLIENT_ENDPOINT")
            message = "Missing environment values: {}".format(", ".join(missing))
            raise EnvironmentError(message)

        self.log.info('Confidential Client, user_id = {}'.format(self.client_user))

        base_path = DESTINATION_BASE_PATH
        # random_key = "{0:04d}".format(randint(0, 10000))
        # transfer_dir = self.make_transfer_dir(random_key)
        # transfer_base_path = os.path.join(base_path, transfer_dir)
        # destination_path = "{}/".format(transfer_base_path)
        destination_path = base_path

        self.log.info('Source endpoint = {}'.format(self.source_endpoint))
        self.log.info('Source path = {}'.format(self.source_path))
        self.log.info('Target endpoint = {}'.format(self.target_endpoint))
        self.log.info('Target path = {}'.format(destination_path))

        cc_transfer_client = self.globus_access.get_transfer_client()
        user_transfer_client = self.get_user_transfer_client() # also sets self.source_user_globus_id
        if not user_transfer_client:
            self.log.error("Unable to create User's Globus Transfer Client")
            return

        cc_transfer_client.endpoint_autoactivate(self.target_endpoint)
        ep = cc_transfer_client.get_endpoint(self.target_endpoint)
        self.log.info(ep['acl_available'])

        self.log.info("Just before call to add_endpoint_acl_rule:")
        self.log.info("  target_endpoint = {}".format(self.target_endpoint))
        self.log.info("  path = {}".format(destination_path))
        self.log.info("  globus user id = {}".format(self.source_user_globus_id))

        try:
            cc_transfer_client.add_endpoint_acl_rule(
                self.target_endpoint,
                dict(principal=self.source_user_globus_id,
                     principal_type='identity', path=destination_path, permissions='rw')
            )
        except TransferAPIError as error:
            # PermissionDenied can happen if a new Portal client is swapped
            # in and it doesn't have endpoint manager on the dest_ep.
            # The /portal/processed directory has been set to to read/write
            # for all users so the subsequent operations will succeed.
            self.log.info(error)
            if error.code == 'PermissionDenied':
                pass
            elif error.code != 'Exists':
                pass

    def get_user_transfer_client(self):
        self.log.info("Getting MC User's globus infomation")
        records = DatabaseInterface().get_globus_auth_info_records_by_user_id(self.user_id)
        # Only the latest
        record = (records[0] if len(records) > 0 else None)
        if not record:
            self.log.info("Globus auth info record for MC user {} does not exist; logged out?".format(self.user_id))
            return None

        # else
        self.log.info("Got MC User's globus information; getting tokens")
        self.source_user_globus_id = record['globus_id']
        transfer_tokens = record['tokens']['transfer.api.globus.org']
        self.log.info("Got transfer.api.globus.org tokens; keys = {}".format(transfer_tokens.keys()))
        transfer_client = \
            self.get_transfer_client(transfer_tokens, self.source_endpoint)
        if not transfer_client:
            self.log.error("Transfer Client is not available; abort")
            return None
        return transfer_client


    #     self.user_transfer_client.endpoint_autoactivate(self.target_endpoint)
    #     transfer_data = TransferData(transfer_client=self.user_transfer_client,
    #                                  source_endpoint=self.source_endpoint,
    #                                  destination_endpoint=self.target_endpoint,
    #                                  label='Test-transfer-for-{}'.format(transfer_dir))
    #     self.log.info("Object transfer_data = {}".format(transfer_data))
    #     transfer_data.add_item(source_path='/',
    #                            destination_path=destination_path,
    #                            recursive=True)
    #     self.log.info("Object transfer_data = {}".format(transfer_data))
    #
    #
    #
    #     self.log.info("Before submit transfer")
    #     results = self.user_transfer_client.submit_transfer(transfer_data)
    #     self.log.info("After submit transfer: {}".format(results))
    #     task_id = results['task_id']
    #     status = "STARTED"
    #     while not status == "SUCCEEDED" and not status == "FAILED":
    #         task = self.user_transfer_client.get_task(task_id)
    #         status = task['status']
    #         self.log.info("Current task status = {}".format(status))
    #         time.sleep(5)
    #
    #     try:
    #         acl = next(acl for acl in self.user_transfer_client.endpoint_acl_list(self.target_endpoint)
    #                    if self.destination_path == acl['path'])
    #     except StopIteration:
    #         pass
    #     except TransferAPIError as ex:
    #         # PermissionDenied can happen if a new Portal client is swapped
    #         # in and it doesn't have endpoint manager on the dest_ep.
    #         # The /portal/processed directory has been set to to writeable
    #         # for all users so the delete task will succeed even if an ACL
    #         # can't be set.
    #         if ex.code == 'PermissionDenied':
    #             pass
    #     else:
    #         self.user_transfer_client.delete_endpoint_acl_rule(self.target_endpoint, acl['id'])
    #

    def get_transfer_client(self, transfer_tokens, endpoint_id, endpoint_path='/'):
        authorizer = RefreshTokenAuthorizer(
            transfer_tokens['refresh_token'],
            self.globus_access.get_auth_client(),
            access_token=transfer_tokens['access_token'],
            expires_at=transfer_tokens['expires_at_seconds'])

        transfer = TransferClient(authorizer=authorizer)

        try:
            transfer.endpoint_autoactivate(endpoint_id)
            listing = transfer.operation_ls(endpoint_id, path=endpoint_path)
        except TransferAPIError as err:
            self.log.error('Error [{}]: {}'.format(err.code, err.message))
            return None

        file_list = [e for e in listing if e['type'] == 'file']
        self.log.info("File list = {}".format(file_list))

        ep = transfer.get_endpoint(endpoint_id)
        self.log.info("Endpoint - display_name = {}".format(ep['display_name']))
        self.log.info("Endpoint - owner_string = {}".format(ep['owner_string']))

        return transfer

    @staticmethod
    def make_transfer_dir(status_record_id):
        return "ep2ep-{}".format(status_record_id)

if __name__ == '__main__':
    LoggingHelper().set_root()
    startup_log = logging.getLogger("main-setup")
    startup_log.info("Starting main-setup")

    argv = sys.argv
    parser = argparse.ArgumentParser(description='Test of Globus non-ETL upload')
    parser.add_argument('-u', '--user_id', type=str, dest="user_id", help="Materials Commons user id; fallback MC_USER_ID env variable; required")
    parser.add_argument('-s', '--source', type=str, dest="source", help="source endpoint; fallback SOURCE_ENDPOINT env var; required")
    parser.add_argument('-p', '--path', type=str, dest="path", help="source endpoint path; fallback SOURCE_ENDPOINT_PATH env var; required")
    parser.add_argument('-d', '--destination', type=str, dest="destination", help="destination endpoint; fallback DESTINATION_ENDPOINT env var; required")
    args = parser.parse_args(argv[1:])

    # Materials Commons User id
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

    # Globus user's source endpoint
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

    # Globus user's source endpoint path
    source_path = None
    if args.path:
        source_path = args.path
    elif os.environ.get('SOURCE_ENDPOINT_PATH'):
        source_path = os.environ.get('SOURCE_ENDPOINT_PATH')
        startup_log.info("Getting source Globus endpoint from SOURCE_ENDPOINT_PATH env var = {}".format(source_endpoint))
    else:
        print("You must specify a source endpoint path. Argument not found.")
        parser.print_help()
        exit(-1)

    # Materials Commons Globus Connect Server endpoint
    destination_endpoint = None
    if args.destination:
        destination_endpoint = args.destination
    elif os.environ.get('DESTINATION_ENDPOINT'):
        destination_endpoint = os.environ.get('DESTINATION_ENDPOINT')
        startup_log.info("Getting destination Globus endpoint from DESTINATION_ENDPOINT env var = {}".format(destination_endpoint))
    elif os.environ.get('MC_CONFIDENTIAL_CLIENT_ENDPOINT'):
        destination_endpoint = os.environ.get('MC_CONFIDENTIAL_CLIENT_ENDPOINT')
        startup_log.info("Getting destination Globus endpoint from MC_CONFIDENTIAL_CLIENT_ENDPOINT env var = {}".format(destination_endpoint))
    else:
        print("You must specify a destination endpoint. Argument not found.")
        parser.print_help()
        exit(-1)

    startup_log.info("Input parameters:")
    startup_log.info("  Materials Commons user_id = {}".format(user_id))
    startup_log.info("  User source_endpoint = {}".format(source_endpoint))
    startup_log.info("  User source_endpoint path = {}".format(source_path))
    startup_log.info("  Globus Connect Server destination_endpoint = {}".format(destination_endpoint))

    transfer_helper = EpEpTransferHelper(user_id, source_endpoint, source_path, destination_endpoint)
    transfer_helper.do_transfer()

