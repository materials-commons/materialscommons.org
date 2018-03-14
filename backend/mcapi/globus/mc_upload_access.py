import os.path as os_path

import configparser

from globus_sdk import ConfidentialAppAuthClient, ClientCredentialsAuthorizer, TransferClient

home = os_path.expanduser("~")
config_path = os_path.join(home, '.globus', 'mc_client_config.ini')

config = configparser.ConfigParser()
config.read(config_path)

client_user = config['mc_client']['user']
client_token = config['mc_client']['token']

SOURCE_ENDPOINT_NAME = 'cc-base'
SOURCE_PATH = '/'


def get_transfer_client():
    confidential_client = ConfidentialAppAuthClient(
        client_id=client_user, client_secret=client_token)
    scopes = "urn:globus:auth:scope:transfer.api.globus.org:all"
    cc_authorizer = ClientCredentialsAuthorizer(
        confidential_client, scopes)
    # create a new client
    transfer_client = TransferClient(authorizer=cc_authorizer)
    return transfer_client


def get_ep_id(transfer, endpoint_name):
    print("My Endpoints:")
    found = None
    for ep in transfer.endpoint_search('cc-base',filter_scope="shared-with-me"):
        print(ep["display_name"])
        if ep["display_name"] == endpoint_name:
            found = ep
    if found:
        return found['id']
    return None


def main():
    # print(client_user, client_token)

    client = get_transfer_client()
    if client:
        print("Got transfer client")
    else:
        print("Failed to get transfer client")
        exit(-1)

    ep_id = get_ep_id(client, SOURCE_ENDPOINT_NAME)
    if ep_id:
        print("Got endpoint id")
    else:
        print("Failed to get endpoint id")
        exit(-1)


if __name__ == '__main__':
    main()
