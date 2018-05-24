import json
import time
import sys
import webbrowser

import configparser
from pathlib import Path

from backend.servers.etlserver.download_try.utils import enable_requests_logging, is_remote_session

from globus_sdk import (NativeAppAuthClient, TransferClient,
                        RefreshTokenAuthorizer)

# Config file set up
home = str(Path.home())
config_path = Path(Path.home(), '.globus', 'config_testing.ini')
config = configparser.ConfigParser()
config.read(str(config_path))

# To set up a client_id, see https://auth.globus.org/v2/web/developers
# Current client_id is in Project: MaterialsCommonsProject, App: MaterialsCommonsTest
CLIENT_ID = config['sdk']['id']

TOKEN_FILE_PATH = Path(Path.home(), '.globus', 'refresh-testing-tokens.json')
REDIRECT_URI = 'https://auth.globus.org/v2/web/auth-code'
SCOPES = ('openid email profile '
          'urn:globus:auth:scope:transfer.api.globus.org:all')

# uncomment the next line to enable debug logging for network requests
# enable_requests_logging()


class GlobusAccess:
    def __init__(self):
        tokens = None
        try:
            # if we already have tokens, load and use them
            tokens = self.load_tokens_from_file(TOKEN_FILE_PATH)
        except:
            pass

        if not tokens:
            # if we need to get tokens, start the Native App authentication process
            tokens = self.do_native_app_authentication(CLIENT_ID, REDIRECT_URI, SCOPES)

            try:
                self.save_tokens_to_file(TOKEN_FILE_PATH, tokens)
            except:
                pass

        self.transfer_tokens = tokens['transfer.api.globus.org']

        self.auth_client = NativeAppAuthClient(client_id=CLIENT_ID)

        def refresh_tokens(token_response):
            context = self
            context.update_tokens_file_on_refresh(token_response)

        self.authorizer = RefreshTokenAuthorizer(
            self.transfer_tokens['refresh_token'],
            self.auth_client,
            access_token=self.transfer_tokens['access_token'],
            expires_at=self.transfer_tokens['expires_at_seconds'],
            on_refresh=refresh_tokens)

    @staticmethod
    def load_tokens_from_file(filepath):
        """Load a set of saved tokens."""
        with open(filepath, 'r') as f:
            tokens = json.load(f)

        return tokens

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
        self.save_tokens_to_file(TOKEN_FILE_PATH, token_response.by_resource_server)

    @staticmethod
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
