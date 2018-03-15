import json
import os.path as os_path

import configparser
from globus_sdk import NativeAppAuthClient, TransferClient, RefreshTokenAuthorizer, TransferData

from .. import args
from .. import dmutil
from ..mcapp import app
from .. import access


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
        self.base_endpoint = "Materials Commons Test"
        self.share_path_on_base = "/Volumes/Data2/GlobusEndpoint/mc-base"
        home = os_path.expanduser("~")
        self.config_path = os_path.join(home, '.globus', 'config_testing.ini')

        config = configparser.ConfigParser()
        config.read(str(self.config_path))

        self.client_id = config['sdk']['id']
        self.token_file_path = os_path.join(home, '.globus', 'refresh-testing-tokens.json')
        self.auth_client = None
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
        
        # create target endpoint
        target_endpoint_name = "Staging Endpoint for " + self.mc_user_id
        target_endpoint_id = self.get_ep_id(transfer, target_endpoint_name)
        if not target_endpoint_id:
            self.log("Target endpoint not found. Creating " + target_endpoint_name)
            target_endpoint_id = self.create_shared_ep(
                transfer, self.base_endpoint, self.share_path_on_base, target_endpoint_name)
        if not target_endpoint_id:
            error = "No shared endpoint client"
            self.log("Error: " + error)
            return {"error": error}

        # confirm inbound_endpoint
        inbound_endpoint = transfer.get_endpoint(inbound_endpoint_id)

        self.log("Client ID Found for target endpoint: " + target_endpoint_name)
        self.log("    - target endpoint id " + target_endpoint_id)
        self.log("    - inbound endpoint: " + inbound_endpoint['display_name']
                 + " from " + inbound_endpoint["owner_string"])
        self.log('Directory listing from inbound_endpoint:')
        for entry in transfer.operation_ls(inbound_endpoint_id, path="/"):
            self.log(entry['name'] + ('/' if entry['type'] == 'dir' else ''))

        # initiate transfer
        transfer_label = "Transfer from " + inbound_endpoint['display_name'] + \
            "Materials Commons"
        transfer_data = TransferData(
            transfer, inbound_endpoint_id, target_endpoint_id, label=transfer_label, sync_level="checksum")
        transfer_data.add_item("/", "/", recursive=True)
        transfer_result = transfer.submit_transfer(transfer_data)

        self.log(transfer_label)
        self.log(transfer_result["message"])

        return transfer_result

    def get_auth_client(self):
        if self.auth_client:
            return self.auth_client
        auth_client = NativeAppAuthClient(client_id=self.client_id)
        self.auth_client = auth_client
        return auth_client

    def get_transfer_interface(self, auth_client):
        if self.transfer_client:
            return self.transfer_client

        tokens = None
        try:
            # if we already have tokens, load and use them
            tokens = self.load_tokens_from_file(self.token_file_path)
        except Exception as problem:
            self.log("Can not get transfer token from configuration file")
            self.log(problem)

        if not tokens:
            return None

        self.log("Transfer Interface Found")

        transfer_tokens = tokens['transfer.api.globus.org']

        authorizer = RefreshTokenAuthorizer(
            transfer_tokens['refresh_token'],
            auth_client,
            access_token=transfer_tokens['access_token'],
            expires_at=transfer_tokens['expires_at_seconds'],
            on_refresh=self.update_tokens_file_on_refresh)

        transfer = TransferClient(authorizer=authorizer)

        return transfer

    @staticmethod
    def load_tokens_from_file(filepath):
        """Load a set of saved tokens."""
        with open(filepath, 'r') as f:
            tokens = json.load(f)
        return tokens

    @staticmethod
    def log(message):
        dmutil.msg(message)

    @staticmethod
    def save_tokens_to_file(filepath, tokens):
        """Save a set of tokens for later use."""
        with open(filepath, 'w') as f:
            json.dump(tokens, f)

    def update_tokens_file_on_refresh(self, token_response):
        """
        Callback function passed into the RefreshTokenAuthorizer.
        Will be invoked any time a new access token is fetched.
        """
        self.save_tokens_to_file(self.token_file_path, token_response.by_resource_server)

    def create_shared_ep(self, transfer, base_ep_name, path, shared_ep_name):
        base_endpoint_id = self.get_ep_id(transfer, base_ep_name)
        if not base_endpoint_id:
            print("Can not find base ep to create sharing: " + base_ep_name)
            return None
        shared_ep_data = {
            "DATA_TYPE": "shared_endpoint",
            "display_name": shared_ep_name,
            "host_endpoint": base_endpoint_id,
            "host_path": path,
        }
        create_result = transfer.create_shared_endpoint(shared_ep_data)
        if not create_result:
            return None
        return create_result["id"]

    @staticmethod
    def acl_add_rule(transfer, user_to_add, endpoint_id, endpoint_path, permissions):
        rule_data = {
            "DATA_TYPE": "access",
            "principal_type": "identity",
            "principal": user_to_add,
            "path": endpoint_path,
            "permissions": permissions
        }
        result = transfer.add_endpoint_acl_rule(endpoint_id, rule_data)
        rule_id = result["access_id"]
        return rule_id

    @staticmethod
    def acl_rule_exists(transfer, user_to_add, endpoint_id, endpoint_path):
        acl_list = transfer.endpoint_acl_list(endpoint_id)["DATA"]
        found = None
        for rule in acl_list:
            if not rule['role_id'] and rule['principal'] == user_to_add \
                    and rule['path'] == endpoint_path:
                found = rule
        return found

    @staticmethod
    def acl_change_rule_permissions(transfer, endpoint_id, rule_id, permissions):
        rule_data = {
            "DATA_TYPE": "access",
            "permissions": permissions
        }
        transfer.update_endpoint_acl_rule(endpoint_id, rule_id, rule_data)

    @staticmethod
    def get_ep_id(transfer, endpoint_name):
        print("My Endpoints:")
        found = None
        for ep in transfer.endpoint_search(endpoint_name, filter_scope="my-endpoints"):
            print(ep["display_name"])
            if ep["display_name"] == endpoint_name:
                found = ep
        if found:
            return found['id']
        return None


# standalone test
if __name__ == "__main__":
    mc_user = "test@test.mc"
    target_uuid = "b626e88c-2873-11e8-b7c4-0ac6873fc732"
    interface = MaterialsCommonsGlobusInterface(mc_user)
    url_or_error = interface.stage_upload_files(target_uuid)
    print("return value = ", url_or_error)
