import os
import json
import configparser
from pathlib import Path

from globus_sdk import ConfidentialAppAuthClient, ClientCredentialsAuthorizer
from globus_sdk import NativeAppAuthClient, RefreshTokenAuthorizer
from globus_sdk import TransferClient, AuthClient
from globus_sdk.exc import TransferAPIError

# ---------------- using Confidential Client ----------------------------------

print("----------  Access probes using Confidential Client ----------")
# operation_ls works
print("** operation_ls works")
client_user = os.environ.get('MC_CONFIDENTIAL_CLIENT_USER')
client_token = os.environ.get('MC_CONFIDENTIAL_CLIENT_PW')
cc_auth_client = ConfidentialAppAuthClient(client_id=client_user, client_secret=client_token)
scopes = "urn:globus:auth:scope:transfer.api.globus.org:all"
cc_authorizer = ClientCredentialsAuthorizer(cc_auth_client, scopes)
cc_transfer_client = TransferClient(authorizer=cc_authorizer)
count = 0
for entry in cc_transfer_client.operation_ls('84b62e46-5ebc-11e8-91d5-0a6d4e044368', path='/testing-59211/'):
    # print(entry['name'] + ('/' if entry['type'] == 'dir' else ''))
    count += 1
print("Found {} files".format(count))

# get_identities works
print("** get_identities works")
results = cc_auth_client.get_identities(usernames='materialscommonstest@globusid.org')
print('found identity: id = {}, name = {}'.format(results['identities'][0]['id'], results['identities'][0]['name']))
id_for_acl = results['identities'][0]['id']

# but... add_endpoint_acl_rule does not work; this is (currently) as expected
print("** add_endpoint_acl_rule fails")
try:
    rule_data = {
        "DATA_TYPE": "access",
        "principal_type": "identity",
        "principal": id_for_acl,
        "path": "/testing-59211/",
        "permissions": "r"
    }
    result = cc_transfer_client.add_endpoint_acl_rule('84b62e46-5ebc-11e8-91d5-0a6d4e044368', rule_data)
    rule_id = result["access_id"]
except TransferAPIError as e:
    # fails, as expected with
    # (403, 'PermissionDenied',
    #     "You do not have permission to manage the ACL on '84b62e46-5ebc-11e8-91d5-0a6d4e044368'",
    #     'vhugP8BZk')
    print('cc_transfer_client.add_endpoint_acl_rule() fails: {}'.format(e))
print("----------  End Confidential Client ----------")

# ---------------- using NativeAppAuth Client ----------------------------------

print("----------  Access probes using NativeAppAuth Client ----------")

# works
print("** add_authentication works - but may require interaction to login")
TOKEN_FILE_PATH = Path(Path.home(), '.globus', 'refresh-testing-tokens.json')
REDIRECT_URI = 'https://auth.globus.org/v2/web/auth-code'
SCOPES = ('openid email profile '
          'urn:globus:auth:scope:transfer.api.globus.org:all')

config_path = Path(Path.home(), '.globus', 'config_testing.ini')
config = configparser.ConfigParser()
config.read(str(config_path))

# To set up a client_id, see https://auth.globus.org/v2/web/developers
# Current client_id is in Project: MaterialsCommonsProject, App: MaterialsCommonsTest
CLIENT_ID = config['sdk']['id']

tokens = None
try:
    # if we already have tokens, load and use them
    with open(TOKEN_FILE_PATH, 'r') as f:
        tokens = json.load(f)
    print("Attempting to use refresh token")
except IOError as e:
    pass

if not tokens:
    print("Token interaction required")
    # if we need to get tokens and save then

    client = NativeAppAuthClient(client_id=CLIENT_ID)
    # pass refresh_tokens=True to request refresh tokens
    client.oauth2_start_flow(requested_scopes=SCOPES,
                             redirect_uri=REDIRECT_URI,
                             refresh_tokens=True)

    url = client.oauth2_get_authorize_url()

    print('Native App Authorization URL: \n{}'.format(url))

    auth_code = input('Enter the auth code: ').strip()

    token_response = client.oauth2_exchange_code_for_tokens(auth_code)
    # return a set of tokens, organized by resource server name
    tokens = token_response.by_resource_server

    try:
        with open(TOKEN_FILE_PATH, 'w') as f:
            json.dump(tokens, f)
    except IOError as e:
        pass


def update_tokens_file_on_refresh(token_response):
    """
    Callback function passed into the RefreshTokenAuthorizer.
    Will be invoked any time a new access token is fetched.
    """
    try:
        with open(TOKEN_FILE_PATH, 'w') as f:
            json.dump(token_response.by_resource_server, f)
    except IOError as e:
        pass


auth_tokens = tokens['auth.globus.org']
auth_client = NativeAppAuthClient(client_id=CLIENT_ID)
authorizer = RefreshTokenAuthorizer(
    auth_tokens['refresh_token'],
    auth_client,
    access_token=auth_tokens['access_token'],
    expires_at=auth_tokens['expires_at_seconds'],
    on_refresh=update_tokens_file_on_refresh)

auth_client = AuthClient(client_id=CLIENT_ID, authorizer=authorizer)

transfer_tokens = tokens['transfer.api.globus.org']

authorizer = RefreshTokenAuthorizer(
    transfer_tokens['refresh_token'],
    auth_client,
    access_token=transfer_tokens['access_token'],
    expires_at=transfer_tokens['expires_at_seconds'],
    on_refresh=update_tokens_file_on_refresh)

transfer_client = TransferClient(authorizer=authorizer)

# operation_ls works - as expected
print("** operation_ls works")
count = 0
for entry in transfer_client.operation_ls('84b62e46-5ebc-11e8-91d5-0a6d4e044368', path='/testing-59211/'):
    # print(entry['name'] + ('/' if entry['type'] == 'dir' else ''))
    count += 1
print("Found {} files".format(count))

print("** get_identities works")
results = auth_client.get_identities(usernames='gtarcea@umich.edu')
print(results['identities'][0]['id'], results['identities'][0]['name'])
id_for_acl = results['identities'][0]['id']

print("** add_endpoint_acl_rule works")
results = transfer_client.endpoint_acl_list('84b62e46-5ebc-11e8-91d5-0a6d4e044368')
rule_id = None
for rule in results["DATA"]:
    if rule['path'] == '/testing-59211/' and rule['principal'] == id_for_acl:
        print("found rule: {}".format(rule))
        rule_id = rule['id']
if rule_id:
    print("Deleted existing rule so that we can test adding rule")
    transfer_client.delete_endpoint_acl_rule('84b62e46-5ebc-11e8-91d5-0a6d4e044368',rule_id)
rule_data = {
    "DATA_TYPE": "access",
    "principal_type": "identity",
    "principal": id_for_acl,
    "path": "/testing-59211/",
    "permissions": "r"
}
result = transfer_client.add_endpoint_acl_rule('84b62e46-5ebc-11e8-91d5-0a6d4e044368', rule_data)
rule_id = None
for rule in results["DATA"]:
    if rule['path'] == '/testing-59211/' and rule['principal'] == id_for_acl:
        print("added rule: ", rule)
        rule_id = rule['id']
        print("added rule: {}".format(rule_id))

print("----------  End NativeAppAuth Client ----------")
