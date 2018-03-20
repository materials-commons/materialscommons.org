import sys
import globus_sdk
import logging

import os.path as os_path

import configparser

home = os_path.expanduser("~")
config_path = os_path.join(home, '.globus', 'mc_client_config.ini')

config = configparser.ConfigParser()
config.read(config_path)

client_user = config['mc_client']['user']
client_token = config['mc_client']['token']

confidential_client = globus_sdk.ConfidentialAppAuthClient(
    client_id=client_user, client_secret=client_token)
scopes = "urn:globus:auth:scope:transfer.api.globus.org:all"

logging.basicConfig(level=logging.DEBUG)
root = logging.getLogger()
root.setLevel(logging.DEBUG)

cc_authorizer = globus_sdk.ClientCredentialsAuthorizer(
    confidential_client, scopes)
# create a new client

logging.basicConfig(level=logging.ERROR)
root = logging.getLogger()
root.setLevel(logging.ERROR)

transfer_client = globus_sdk.TransferClient(authorizer=cc_authorizer)

# usage is still the same
print("Endpoints Belonging to {}@clients.auth.globus.org:"
      .format(transfer_client))
for ep in transfer_client.endpoint_search({'filter-scope': 'my-endpoints'}):
    print("[{}] {}".format(ep["id"], ep["display_name"]))