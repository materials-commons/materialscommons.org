import json
import time
import sys
import webbrowser

import configparser
from pathlib import Path

from globus.utils import is_remote_session

# uncomment for logging of network requests
# from globus.utils import enable_requests_logging

from globus_sdk import (NativeAppAuthClient, TransferClient,
                        RefreshTokenAuthorizer)
from globus_sdk.exc import GlobusAPIError

home = str(Path.home())
config_path = Path(Path.home(), '.globus', 'config_testing.ini')

config = configparser.ConfigParser()
config.read(str(config_path))

CLIENT_ID = config['sdk']['id']
# AUTH_CODE = config['sdk']['auth']

TOKEN_FILE_PATH = Path(Path.home(), '.globus', 'refresh-testing-tokens.json')
REDIRECT_URI = 'https://auth.globus.org/v2/web/auth-code'
SCOPES = ('openid email profile '
          'urn:globus:auth:scope:transfer.api.globus.org:all')

SOURCE_NAME = 'Weymouth Mac Desktop'
SHARING_ENDPOINT_NAME = "Sharing on Weymouth Mac Desktop"

# uncomment the next line to enable debug logging for network requests
# enable_requests_logging()


def load_tokens_from_file(filepath):
    """Load a set of saved tokens."""
    with open(filepath, 'r') as f:
        tokens = json.load(f)

    return tokens


def save_tokens_to_file(filepath, tokens):
    """Save a set of tokens for later use."""
    with open(filepath, 'w') as f:
        json.dump(tokens, f)


def update_tokens_file_on_refresh(token_response):
    """
    Callback function passed into the RefreshTokenAuthorizer.
    Will be invoked any time a new access token is fetched.
    """
    save_tokens_to_file(TOKEN_FILE_PATH, token_response.by_resource_server)


def do_native_app_authentication(client_id, redirect_uri,
                                 requested_scopes=None):
    """
    Does a Native App authentication flow and returns a
    dict of tokens keyed by service name.
    """
    client = NativeAppAuthClient(client_id=client_id)
    # pass refresh_tokens=True to request refresh tokens
    client.oauth2_start_flow(requested_scopes=requested_scopes,
                             redirect_uri=redirect_uri,
                             refresh_tokens=True)

    url = client.oauth2_get_authorize_url()

    print('Native App Authorization URL: \n{}'.format(url))

    if not is_remote_session():
        webbrowser.open(url, new=1)

    auth_code = input('Enter the auth code: ').strip()

    token_response = client.oauth2_exchange_code_for_tokens(auth_code)

    # return a set of tokens, organized by resource server name
    return token_response.by_resource_server


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


def get_transfer_interface():
    tokens = None
    try:
        # if we already have tokens, load and use them
        tokens = load_tokens_from_file(TOKEN_FILE_PATH)
    except:
        pass

    if not tokens:
        # if we need to get tokens, start the Native App authentication process
        tokens = do_native_app_authentication(CLIENT_ID, REDIRECT_URI, SCOPES)

        try:
            save_tokens_to_file(TOKEN_FILE_PATH, tokens)
        except:
            pass

    if not tokens:
        return None

    transfer_tokens = tokens['transfer.api.globus.org']

    auth_client = NativeAppAuthClient(client_id=CLIENT_ID)

    authorizer = RefreshTokenAuthorizer(
        transfer_tokens['refresh_token'],
        auth_client,
        access_token=transfer_tokens['access_token'],
        expires_at=transfer_tokens['expires_at_seconds'],
        on_refresh=update_tokens_file_on_refresh)

    transfer = TransferClient(authorizer=authorizer)

    return transfer


def create_shared_ep(transfer, base_ep_name, path, shared_ep_name):
    id = get_ep_id(transfer, base_ep_name)
    if not id:
        print("Can not find base ep to create sharing: " + base_ep_name)
        return None
    shared_ep_data = {
        "DATA_TYPE": "shared_endpoint",
        "display_name": shared_ep_name,
        "host_endpoint": id,
        "host_path": path,
    }
    create_result = transfer.create_shared_endpoint(shared_ep_data)
    if not create_result:
        return None
    return create_result["id"]


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


def acl_rule_exists(transfer, user_to_add, endpoint_id, endpoint_path):
    acl_list = transfer.endpoint_acl_list(endpoint_id)["DATA"]
    found = None
    for rule in acl_list:
        if not rule['role_id'] and rule['principal'] == user_to_add \
                and rule['path'] == endpoint_path:
            found = rule
    return found

def acl_change_rule_permissions(transfer, endpoint_id, rule_id, permissions):
    rule_data = {
            "DATA_TYPE": "access",
            "permissions": permissions
    }
    transfer.update_endpoint_acl_rule(endpoint_id, rule_id, rule_data)
