import argparse
import sys
import os
import logging
import time
from random import randint
from globus_sdk.exc import GlobusAPIError
from globus_sdk import ConfidentialAppAuthClient, ClientCredentialsAuthorizer
from globus_sdk import TransferClient, TransferData, TransferAPIError


class ProbeGlobusInterface:
    def __init__(self):
        self.log = logging.getLogger(self.__class__.__name__)
        self.log.debug(" init - started")

        self.client_user = os.environ.get('MC_CONFIDENTIAL_CLIENT_USER')
        self.client_token = os.environ.get('MC_CONFIDENTIAL_CLIENT_PW')
        self.mc_target_ep_id = os.environ.get('MC_CONFIDENTIAL_CLIENT_ENDPOINT')

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

        self.log.info("Env variables are ok")
        self.log.info("  -- MC_CONFIDENTIAL_CLIENT_USER = {}".format(self.client_user))
        self.log.info("  -- MC_CONFIDENTIAL_CLIENT_ENDPOINT = {}".format(self.mc_target_ep_id))

        self.transfer_client = None
        self.log.debug(" init - done")

    def set_transfer_client(self):
        self.log.debug(" set_transfer_client - started")
        auth_client = self.get_auth_client()
        if not auth_client:
            error = "No Authentication Client"
            self.log.error("Error: " + str(error))
            raise AuthenticationException(error)
        self.log.info("set_transfer_client - auth_client = {}".format(auth_client.client_id))
        transfer = self.get_transfer_interface(auth_client)
        if not transfer:
            error = "No transfer interface"
            self.log.error("Error: " + str(error))
            raise AuthenticationException(error)
        self.transfer_client = transfer
        self.log.debug(" set_transfer_client - done")
        return {"status": "ok"}

    def check_endpoint_transfer(self, inbound_endpoint_id, path_spreadsheet, path_data_dir):
        if not self.transfer_client:
            error = "Missing authenticated transfer client"
            self.log.error("Error: " + str(error))
            raise AuthenticationException(error)

        transfer = self.transfer_client
        self.log.debug("Starting upload staging... function: check_endpoint_transfer(inbound_endpoint_id)")
        self.log.info("Globus user's transfer endpoint uuid = {}".format(inbound_endpoint_id))
        self.log.info("Globus Confidential Client endpoint uuid = {}".format(self.mc_target_ep_id))
        # confirm target and inbound endpoints
        target_endpoint = transfer.get_endpoint(self.mc_target_ep_id)
        inbound_endpoint = transfer.get_endpoint(inbound_endpoint_id)

        if not target_endpoint:
            error = "Missing target endpoint, Materials Commons staging"
            self.log.error("Error: " + str(error))
            raise NoSuchItem(error)

        if not inbound_endpoint:
            error = "Missing inbound endpoint, user's input for staging"
            self.log.error("Error: " + str(error))
            raise NoSuchItem(error)

        target_endpoint_id = target_endpoint['id']

        self.log.info("Globus user's transfer endpoint name = {}".format(inbound_endpoint['display_name']))
        self.log.info("Globus Confidential Client endpoint name = {}".format(target_endpoint['display_name']))

        self.log.debug("About to confirm inbound path for data dir: " + path_data_dir)
        try:
            transfer.operation_ls(inbound_endpoint_id, path=path_data_dir)
        except TransferAPIError as error:
            self.log.error("Error: " + str(error))
            raise error

        self.log.debug("Finished confirm of inbound path for data dir: " + path_data_dir)

        transfer_base_path = self.make_random_name("directory_probe-")
        response = transfer.operation_mkdir(target_endpoint_id, transfer_base_path)
        if not response["code"] == "DirectoryCreated":
            error = "Unable to create directory on target endpoint " + transfer_base_path
            self.log.error("Error: " + str(error))
            raise TransferAPIError(error)

        target_path_spreadsheet = os.path.join(transfer_base_path, path_spreadsheet)
        target_path_data_dir = os.path.join(transfer_base_path, path_data_dir)

        self.log.info("Initiating transfer to target directory: " + transfer_base_path)
        self.log.info("  endpoint '{}' --> endpoint '{}'".format(
            inbound_endpoint['display_name'], target_endpoint['display_name']))
        self.log.info("  from {} to {}, and ".format(path_spreadsheet, target_path_spreadsheet))
        self.log.info("  from {} to {}, and ".format(path_data_dir, target_path_data_dir))

        transfer_label = "Transfer from " + inbound_endpoint['display_name'] + \
                         "Materials Commons"
        transfer_data = TransferData(
            transfer, inbound_endpoint_id, target_endpoint_id, label=transfer_label, sync_level="checksum")
        transfer_data.add_item(path_spreadsheet, target_path_spreadsheet)
        transfer_data.add_item(path_data_dir, target_path_data_dir, recursive=True)
        transfer_result = transfer.submit_transfer(transfer_data)
        self.log.debug("Finished upload transfer request: successfully completed")
        return_result = {}
        keys = ["code", "message", "task_id", "submission_id"]
        for key in keys:
            return_result[key] = transfer_result[key]

        self.log.debug("Ending upload staging.")
        return return_result

    def get_task_status(self, task_id):
        if not self.transfer_client:
            error = "Missing authenticated transfer client"
            self.log.error("Error: " + str(error))
            raise AuthenticationException(error)

        transfer = self.transfer_client

        error = None
        for event in transfer.task_event_list(task_id):
            if event["is_error"]:
                error = event

        if error:
            self.log.error("Globus transfer error: " + error['description'])
            self.log.error("   -- code " + error['code'])
            self.log.error("   -- message " + error['details'])
            error = {"error": error['code'], "message": error['details']}
        transfer_result = transfer.get_task(task_id)

        return_result = {}
        if error:
            return_result = error
        keys = ["status", "nice_status_details", "files", "files_skipped"]
        for key in keys:
            return_result[key] = transfer_result[key]
        return return_result

    def get_auth_client(self):
        auth_client = ConfidentialAppAuthClient(
            client_id=self.client_user, client_secret=self.client_token)
        return auth_client

    def get_transfer_interface(self, auth_client):
        self.log.debug("get_transfer_interface")
        if self.transfer_client:
            self.log.debug("found transfer_client")
            return self.transfer_client

        self.log.debug("transfer_client - not set - attempting")
        self.log.debug("auth_client")
        self.log.debug(auth_client)

        scopes = "urn:globus:auth:scope:transfer.api.globus.org:all"
        cc_authorizer = ClientCredentialsAuthorizer(auth_client, scopes)
        transfer_client = TransferClient(authorizer=cc_authorizer)
        self.log.debug("get_transfer_interface - transfer_client")
        self.log.debug(transfer_client)
        return transfer_client

    @staticmethod
    def make_random_name(prefix):
        number = "%05d" % randint(0, 99999)
        return prefix + number


class ProbeException(Exception):
    def __init__(self, attr):
        self.attr = str(attr)


def main(user_endpoint, user_spreadsheet, user_data_dir):

    wait_seconds = 5

    log = logging.getLogger("main-with-args")

    interface = ProbeGlobusInterface()
    try:
        results = interface.set_transfer_client()
        if results:
            results = interface.check_endpoint_transfer(user_endpoint, user_spreadsheet, user_data_dir)
            task_id = results['task_id']
            status = "ACTIVE"
            time_seconds = 0
            while status == "ACTIVE":
                time.sleep(wait_seconds)
                time_seconds += wait_seconds
                log.info("Waiting for transfer: {} seconds".format(time_seconds))
                results = interface.get_task_status(task_id)
                log.debug("Results from get_task_status = {}".format(results))
                status = results['status']
            log.info("Done.")
        else:
            log.error("Failed to set transfer client")
    except GlobusAPIError as error:
        http_status = error.http_status
        code = error.code
        details = error.message
        message = "Unable to connect to the Globus Connection server (based on configuration information): "
        message += " http_status = " + str(http_status)
        message += ", code = " + code
        message += ", message = " + details
        log.error(message)
        return None

    log.info("main() was successful")

    return "ok"


if __name__ == "__main__":
    root = logging.getLogger()
    root.setLevel(logging.INFO)

    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(name)s - %(lineno)s - %(message)s')
    ch.setFormatter(formatter)
    root.addHandler(ch)

    local_log = logging.getLogger("main-setup")

    # suppress info logging for globus_sdk loggers that are invoked, while leaving my info logging in place
    logger_list = ['globus_sdk.authorizers.basic', 'globus_sdk.authorizers.client_credentials',
                   'globus_sdk.authorizers.renewing', 'globus_sdk.transfer.client.TransferClient',
                   'globus_sdk.transfer.paging', 'globus_sdk.config', 'globus_sdk.exc',
                   'globus_sdk.transfer.data',
                   'globus_sdk.auth.client_types.confidential_client.ConfidentialAppAuthClient',
                   'urllib3.connectionpool']
    for name in logger_list:
        logging.getLogger(name).setLevel(logging.ERROR)

    argv = sys.argv
    parser = argparse.ArgumentParser(description='Check that Globus/ETL setup is working')
    parser.add_argument('--endpoint', type=str, help="User's Globus Endpoint")
    parser.add_argument('--spreadsheet', type=str, help="Relative path (in user endpoint) to spreadsheet")
    parser.add_argument('--data', type=str, help="Relative path (in user endpoint) to data dir")
    args = parser.parse_args(argv[1:])

    # NOTE, defaults of input values are for Weymouth's personal connect desktop globus endpoint
    # --endpoint 6a0b54a6-5302-11e8-9060-0a6d4e044368
    # --spreadsheet workflow.xlsx
    # --data data

    if not args.endpoint:
        args.endpoint = '6a0b54a6-5302-11e8-9060-0a6d4e044368'
    if not args.spreadsheet:
        args.spreadsheet = 'workflow.xlsx'
    if not args.data:
        args.data = 'data'

    local_log.info("Command Line arguments:")
    local_log.info("    args.endpoint = {}".format(args.endpoint))
    local_log.info("    args.spreadsheet = {}".format(args.spreadsheet))
    local_log.info("    args.data = {}".format(args.data))

    try:

        results_main = main(args.endpoint, args.spreadsheet, args.data)

        if not results_main:
            local_log.error("Check failed")
        else:
            local_log.info("Check was sucessful")

    except ProbeException as e:
        local_log.exception(e)


class RequiredAttributeException(ProbeException):
    def __init__(self, attr):
        self.attr = str(attr)


class AuthenticationException(ProbeException):
    def __init__(self, attr):
        self.attr = str(attr)


class NoSuchItem(ProbeException):
    def __init__(self, attr):
        self.attr = str(attr)
