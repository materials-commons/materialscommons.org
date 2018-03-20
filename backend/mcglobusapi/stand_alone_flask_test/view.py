import os.path as os_path
import logging
import sys
import json

import configparser
from globus_sdk import ConfidentialAppAuthClient, ClientCredentialsAuthorizer

from flask import Flask
app = Flask(__name__)


@app.route('/', methods=['GET'])
def check_create_cc():
    print("TESTING CC")
    cc = CC()
    cc.doit()
    return json.dumps({'ok':'ok'})


def my_msg(s):
    print(s)
    sys.stdout.flush()


class CC(object):
    def __init__(self):
        pass

    def doit(self):
        my_msg("Starting CC test")
        home = os_path.expanduser("~")
        config_path = os_path.join(home, '.mcglobusapi', 'mc_client_config.ini')

        config = configparser.ConfigParser()
        config.read(config_path)

        client_user = config['mc_client']['user']
        client_token = config['mc_client']['token']

        confidential_client = ConfidentialAppAuthClient(
            client_id=client_user, client_secret=client_token)
        scopes = "urn:mcglobusapi:auth:scope:transfer.api.mcglobusapi.org:all"

        logging.basicConfig(level=logging.DEBUG)
        root = logging.getLogger()
        root.setLevel(logging.DEBUG)

        my_msg("Just before call")
        cc_authorizer = ClientCredentialsAuthorizer(
            confidential_client, scopes)
        my_msg("Just after call")

        print(cc_authorizer)
        my_msg("Done.")
