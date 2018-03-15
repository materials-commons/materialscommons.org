import json
import os.path as os_path

import configparser
from globus_sdk import NativeAppAuthClient, TransferClient, RefreshTokenAuthorizer

from .. import args
from .. import dmutil
from ..mcapp import app


@app.route('/mcglobus/test', methods=['GET'])
def mc_globus_test():
    web_service = MaterialsCommonsGlobusInterface()
    results = web_service.get_upload_url()
    return args.json_as_format_arg(results)


class MaterialsCommonsGlobusInterface:
    def __init__(self):
        self.base_endpoint = "Weymouth Mac Desktop"
        self.share_path_on_base = "/Volumes/Data2/GlobusEndpoint/mc-base/Project - Demo_Project - e4fd5c88"
        self.share_endpoint = "Weymouth Desktop Code Generated Share"
        self.share_endpoint_path = "/"
        home = os_path.expanduser("~")
        print (home)
        self.config_path = os_path.join(home, '.globus', 'config_testing.ini')

        config = configparser.ConfigParser()
        config.read(str(self.config_path))

        self.client_id = config['sdk']['id']
        self.token_file_path = os_path.join(home, '.globus', 'refresh-testing-tokens.json')

    def get_upload_url(self):
        transfer = self.get_transfer_interface()
        if not transfer:
            error = "No transfer interface"
            self.log("Error: " + error)
            return {"error": error}
        shared_endpoint_id = self.get_ep_id(transfer, self.share_endpoint)
        if not shared_endpoint_id:
            print ("Shared endpoint not found. Creating ", self.share_endpoint)
            shared_endpoint_id = self.create_shared_ep(
                transfer, self.base_endpoint, self.share_path_on_base, self.share_endpoint)
        if not shared_endpoint_id:
            print("No shared endpoint client")
            exit(-1)
        print("Client ID Found for share endpoint: " + self.share_endpoint)
        print("    - id is ", shared_endpoint_id)
        print("    - listing entries in endpoint path: " + self.share_endpoint_path)

        user_to_add = 'dfacf93e-0479-49d3-b9ec-2bd4c86e5770'
        #user_to_add = "ec5d8b49-726c-44d7-a0cd-1d11e607a2f0"
        rule = self.acl_rule_exists(transfer, user_to_add, shared_endpoint_id, self.share_endpoint_path)
        print("rule exists: ", rule)
        if rule:
            permissions = rule['permissions']
            if not permissions == "rw":
                print("not this: ", permissions)
                self.acl_change_rule_permissions(transfer, shared_endpoint_id, rule['id'], "rw")
            else:
                print("Permissions ok.")
        else:
            print("Creating rule...")
            self.acl_add_rule(transfer, user_to_add, shared_endpoint_id, self.share_endpoint_path, "rw")
            print("Created rule")

        url = "https://www.globus.org/app/transfer?" + \
              "&origin_id=" + shared_endpoint_id + \
              "&origin_path=" + self.share_endpoint_path + \
              "&add_identity=" + user_to_add

        return {
            'url': url
        }

    def get_transfer_interface(self):
        tokens = None
        try:
            # if we already have tokens, load and use them
            tokens = self.load_tokens_from_file(self.token_file_path)
        except Exception as problem:
            print(problem)
            pass

        if not tokens:
            return None

        self.log("Transfer Interface Found")

        transfer_tokens = tokens['transfer.api.globus.org']

        auth_client = NativeAppAuthClient(client_id=self.client_id)

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
        for ep in transfer.endpoint_search(filter_scope="my-endpoints"):
            print(ep["display_name"])
            if ep["display_name"] == endpoint_name:
                found = ep
        if found:
            return found['id']
        return None


# standalone test
if __name__ == "__main__":
    interface = MaterialsCommonsGlobusInterface()
    url_or_error = interface.get_upload_url()
    print("return value = ", url_or_error)
