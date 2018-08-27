#!/usr/bin/env python
import os
import logging
import time
from random import randint

from globus_sdk import (RefreshTokenAuthorizer, TransferClient, TransferAPIError,
                        TransferData)
from ..utils.LoggingHelper import LoggingHelper
from ..common.TestProject import TestProject
from ..common.McdirHelper import McdirHelper
from ..common.MaterialsCommonsGlobusInterfaceNew import MaterialsCommonsGlobusInterfaceNew
from ..database.DatabaseInterface import DatabaseInterface

SOURCE_ENDPOINT = 'e1a3e368-aa26-11e8-9704-0a6d4e044368'  # '85908598-a7cb-11e8-9700-0a6d4e044368'
TARGET_ENDPOINT = '201a9d80-86d7-11e8-9571-0a6d4e044368'  # 'e7ecb6b6-9002-11e8-9663-0a6d4e044368'


class EpEpTransferHelper:
    def __init__(self, project_id, user_id):
        self.project_id = project_id
        self.user_id = user_id
        self.log = logging.getLogger(self.__class__.__name__)
        self.worker_base_path = McdirHelper().get_upload_dir()
        self.mc_interface = MaterialsCommonsGlobusInterfaceNew(user_id)
        self.client_user = os.environ.get('MC_CONFIDENTIAL_CLIENT_USER')
        self.client_token = os.environ.get('MC_CONFIDENTIAL_CLIENT_PW')
        self.mc_target_ep_id = os.environ.get('MC_CONFIDENTIAL_CLIENT_ENDPOINT')
        self.transfer_client = None

    def do_transfer(self):
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

        base_path = self.worker_base_path
        random_key = "{0:04d}".format(randint(0, 10000))
        transfer_dir = self.make_transfer_dir(random_key)
        transfer_base_path = os.path.join(base_path, transfer_dir)
        os.mkdir(transfer_base_path)
        self.log.info("transfer_base_path = {}".format(transfer_base_path))
        source_endpoint = SOURCE_ENDPOINT
        self.log.info("source_endpoint = {}".format(source_endpoint))

        records = DatabaseInterface().get_globus_auth_info_records_by_user_id(self.user_id)
        # Only the latest
        record = (records[0] if len(records) > 0 else None)
        if not record:
            self.log.info("Globus auth info record does not exist; logged out?")
            return

        # else
        transfer_tokens = record['tokens']['transfer.api.globus.org']
        self.log.info("transfer.api.globus.org tokens = {}".format(transfer_tokens))
        self.transfer_client = \
            self.get_transfer_client(transfer_tokens, source_endpoint)
        if not self.transfer_client:
            self.log.error("Transfer Client is not available; abort")
            return

        # else
        transfer_data = TransferData(transfer_client=self.transfer_client,
                                     source_endpoint=SOURCE_ENDPOINT,
                                     destination_endpoint=TARGET_ENDPOINT,
                                     label='Test-transfer-for-{}'.format(transfer_dir))
        self.log.info("Object transfer_data = {}".format(transfer_data))
        transfer_data.add_item(source_path='/',
                               destination_path="/{}".format(transfer_dir),
                               recursive=True)
        self.log.info("Object transfer_data = {}".format(transfer_data))
        self.transfer_client.endpoint_autoactivate(SOURCE_ENDPOINT)
        self.transfer_client.endpoint_autoactivate(TARGET_ENDPOINT)
        self.log.info("Before submit transfer")
        results = self.transfer_client.submit_transfer(transfer_data)
        self.log.info("After submit transfer: {}".format(results))
        task_id = results['task_id']
        status = "STARTED"
        while not status == "SUCCEEDED" and not status == "FAILED":
            task = self.transfer_client.get_task(task_id)
            status = task['status']
            self.log.info("Current task status = {}".format(status))
            time.sleep(5)

    def get_transfer_client(self, transfer_tokens, endpoint_id, endpoint_path='/'):
        materials_commons_client = self.mc_interface.get_auth_client()
        authorizer = RefreshTokenAuthorizer(
            transfer_tokens['refresh_token'],
            materials_commons_client,
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

        https_server = ep['https_server']
        endpoint_uri = https_server + endpoint_path if https_server else None
        self.log.info("endpoint_uri = {}".format(endpoint_uri))
        return transfer

    @staticmethod
    def make_transfer_dir(status_record_id):
        return "ep2ep-{}".format(status_record_id)


def main(project):
    log = logging.getLogger("main")
    log.info("Starting: main()")
    transfer_helper = EpEpTransferHelper(project.id, 'gtarcea@umich.edu')
    transfer_helper.do_transfer()


if __name__ == '__main__':
    LoggingHelper().set_root()
    startup_log = logging.getLogger("main-setup")
    startup_log.info("Starting main-setup")

    apikey = os.environ.get('APIKEY')
    test_project = TestProject(apikey).get_project()
    startup_log.info("generated test project - name = {}; id = {}".
                     format(test_project.name, test_project.id))

    main(test_project)
