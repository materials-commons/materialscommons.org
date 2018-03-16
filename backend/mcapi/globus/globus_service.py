import os.path as os_path
import configparser

from globus_sdk import ConfidentialAppAuthClient, ClientCredentialsAuthorizer
from globus_sdk import TransferClient, TransferData

from .. import access
from .. import args
from .. import dmutil
from ..mcapp import app


@app.route('/mcglobus/upload/staging/<endpoint_uuid>', methods=['GET'])
def mc_globus_test(endpoint_uuid):
    user = access.get_user()
    web_service = MaterialsCommonsGlobusInterface(user)
    results = web_service.stage_upload_files(endpoint_uuid)
    args.format = True
    return args.json_as_format_arg(results)


class MaterialsCommonsGlobusInterface:
    def __init__(self, mc_user_id):
        self.mc_user_id = mc_user_id
        home = os_path.expanduser("~")
        self.config_path = os_path.join(home, '.globus', 'mc_client_config.ini')

        config = configparser.ConfigParser()
        config.read(str(self.config_path))

        self.client_user = config['mc_client']['user']
        self.client_token = config['mc_client']['token']
        self.mc_target_ep_id = config['mc_client']['ep_id']

        self.transfer_client = None

    def stage_upload_files(self, inbound_endpoint_id):
        self.log("Starting upload staging: get upload url")
        self.log("Materials Commons user = " + self.mc_user_id)
        self.log("Globus transfer endpoint uuid = " + inbound_endpoint_id)

        # get transfer client
        auth_client = self.get_auth_client()
        if not auth_client:
            error = "No Authentication Client"
            self.log("Error: " + error)
            return {"error": error}
        transfer = self.get_transfer_interface(auth_client)
        if not transfer:
            error = "No transfer interface"
            self.log("Error: " + error)
            return {"error": error}

        # confirm target and inbound endpoints
        target_endpoint = transfer.get_endpoint(self.mc_target_ep_id)
        inbound_endpoint = transfer.get_endpoint(inbound_endpoint_id)

        if not target_endpoint:
            error = "Missing target endpoint, Materials Commons staging"
            self.log("Error: " + error)
            return {"error": error}

        if not inbound_endpoint:
            error = "Missing inbound endpoint, user's input for staging"
            self.log("Error: " + error)
            return {"error": error}

        target_endpoint_id = target_endpoint['id']
        target_directory = "MakeADir_name_with_users_uuid"

        self.log("Found for target endpoint: " + target_endpoint['display_name'])
        self.log("    - target endpoint id " + target_endpoint_id)
        self.log("Found inbound endpoint: " + inbound_endpoint['display_name']
                 + " from " + inbound_endpoint["owner_string"])

        # initiate transfer
        transfer_label = "Transfer from " + inbound_endpoint['display_name'] + \
                         "Materials Commons"
        transfer_data = TransferData(
            transfer, inbound_endpoint_id, target_endpoint_id, label=transfer_label, sync_level="checksum")
        transfer_data.add_item("/", "/", recursive=True)
        transfer_result = transfer.submit_transfer(transfer_data)
        self.log(transfer_label)
        self.log(transfer_result["message"])
        task_id = transfer_result["task_id"]
        while not transfer.task_wait(task_id, timeout=10, polling_interval=10):
            self.log("Another ten seconds went by without {0} terminating".format(task_id))
        transfer_result = transfer.get_task(task_id)
        self.log(transfer_label)
        self.log(transfer_result["message"])

        return transfer_result

    def get_auth_client(self):
        auth_client = ConfidentialAppAuthClient(
            client_id=self.client_user, client_secret=self.client_token)
        return auth_client

    def get_transfer_interface(self, auth_client):
        if self.transfer_client:
            return self.transfer_client

        scopes = "urn:globus:auth:scope:transfer.api.globus.org:all"
        cc_authorizer = ClientCredentialsAuthorizer(auth_client, scopes)
        transfer_client = TransferClient(authorizer=cc_authorizer)
        return transfer_client

    @staticmethod
    def log(message):
        dmutil.msg(message)


# standalone test
if __name__ == "__main__":
    mc_user = "test@test.mc"
    target_uuid = "b626e88c-2873-11e8-b7c4-0ac6873fc732"
    interface = MaterialsCommonsGlobusInterface(mc_user)
    url_or_error = interface.stage_upload_files(target_uuid)
    print("return value = ", url_or_error)
