import json
import os.path as os_path

import configparser
from globus_sdk import ConfidentialAppAuthClient, ClientCredentialsAuthorizer, TransferClient

from ..decorators import apikey
from .. import access
from .. import args
from .. import dmutil
from ..mcapp import app


@app.route('/mcglobus/upload/staging/<globus_user>', methods=['GET'])
@apikey
def mc_globus_upload_staging(globus_user):
    user = access.get_user()
    web_service = MaterialsCommonsGlobusInterface(user, globus_user)
    results = web_service.get_upload_url()
    return args.json_as_format_arg(results)


class MaterialsCommonsGlobusInterface:
    def __init__(self, user_id, globus_user):
        home = os_path.expanduser("~")
        config_path = os_path.join(home, '.globus', 'mc_client_config.ini')

        config = configparser.ConfigParser()
        config.read(config_path)

        self.client_user = config['mc_client']['user']
        self.client_token = config['mc_client']['token']

        self.materials_commons_user_id = user_id
        self.globus_user_name = globus_user

        self.base_endpoint = 'cc-base'
        self.share_path_on_base = '/'
        self.share_endpoint = "Upload staging EP for " + user_id

        self.share_endpoint_path = "/"

    def get_upload_url(self):
        transfer = self.get_transfer_client()
        if not transfer:
            error = "No transfer interface"
            self.log("Error: " + error)
            return {"error": error}
        self.log("Transfer client: " + str(transfer))
        shared_endpoint_id = self.get_ep_id(transfer, self.share_endpoint)
        if not shared_endpoint_id:
            self.log("Shared endpoint not found. Creating " + self.share_endpoint)
            shared_endpoint_id = self.create_shared_ep(
                transfer, self.base_endpoint, self.share_path_on_base, self.share_endpoint)
        if not shared_endpoint_id:
            error = "No shared endpoint client- " + self.base_endpoint + "::" + self.share_path_on_base
            self.log(error)
            return {"error": error}
        self.log("Client ID Found for share endpoint: " + self.share_endpoint)
        self.log("    - id is " + shared_endpoint_id)
        self.log("    - listing entries in endpoint path: " + self.share_endpoint_path)

        # rule = self.acl_rule_exists(transfer, user_to_add, shared_endpoint_id, self.share_endpoint_path)
        # print("rule exists: ", rule)
        # if rule:
        #     permissions = rule['permissions']
        #     if not permissions == "rw":
        #         print("not this: ", permissions)
        #         self.acl_change_rule_permissions(transfer, shared_endpoint_id, rule['id'], "rw")
        #     else:
        #         print("Permissions ok.")
        # else:
        #     print("Creating rule...")
        #     self.acl_add_rule(transfer, user_to_add, shared_endpoint_id, self.share_endpoint_path, "rw")
        #     print("Created rule")
        #
        # url = "https://www.globus.org/app/transfer?" + \
        #       "&origin_id=" + shared_endpoint_id + \
        #       "&origin_path=" + self.share_endpoint_path + \
        #       "&add_identity=" + user_to_add

        url = "none yet"
        return {
            'url': url
        }

    def get_transfer_client(self):
        confidential_client = ConfidentialAppAuthClient(
            client_id=self.client_user, client_secret=self.client_token)
        scopes = "urn:globus:auth:scope:transfer.api.globus.org:all"
        cc_authorizer = ClientCredentialsAuthorizer(
            confidential_client, scopes)
        transfer_client = TransferClient(authorizer=cc_authorizer)
        return transfer_client

    @staticmethod
    def load_tokens_from_file(filepath):
        """Load a set of saved tokens."""
        with open(filepath, 'r') as f:
            tokens = json.load(f)
        return tokens

    @staticmethod
    def log(message):
        dmutil.msg(message)

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
        for ep in transfer.endpoint_search(endpoint_name,filter_scope="shared-with-me"):
            print(ep["display_name"])
            if ep["display_name"] == endpoint_name:
                found = ep
        if found:
            return found['id']
        return None


# standalone test
if __name__ == "__main__":
    interface = MaterialsCommonsGlobusInterface('tew@test.mc','materialscommonstest@globusid.org')
    url_or_error = interface.get_upload_url()
    print("return value = ", url_or_error)
