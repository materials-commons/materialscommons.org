import logging
import json
import webbrowser

import configparser
from pathlib import Path

from .utils import is_remote_session
# from .utils import enable_requests_logging

from globus_sdk import NativeAppAuthClient, TransferClient, \
    RefreshTokenAuthorizer, AuthClient

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


class GlobusAccessWithNativeAppAuth:
    def __init__(self):
        self.log = logging.getLogger(self.__class__.__name__)
        self.log.info("init - started")

        tokens = None
        try:
            # if we already have tokens, load and use them
            tokens = self._load_tokens_from_file(TOKEN_FILE_PATH)
        except IOError:
            pass

        if not tokens:
            # if we need to get tokens, start the Native App authentication process
            tokens = self.do_native_app_authentication(CLIENT_ID, REDIRECT_URI, SCOPES)

            try:
                self._save_tokens_to_file(TOKEN_FILE_PATH, tokens)
            except IOError:
                pass

        try:
            auth_tokens = tokens['auth.globus.org']
            transfer_tokens = tokens['transfer.api.globus.org']
        except KeyError as er:
            self.log.error("KeyError on NativeApp tokens: {}\n delete {} and restart"
                           .format(er, TOKEN_FILE_PATH))

        def refresh_tokens(token_response):
            context = self
            context._update_tokens_file_on_refresh(token_response)

        auth_client = NativeAppAuthClient(client_id=CLIENT_ID)
        authorizer = RefreshTokenAuthorizer(
            auth_tokens['refresh_token'],
            auth_client,
            access_token=auth_tokens['access_token'],
            expires_at=auth_tokens['expires_at_seconds'],
            on_refresh=refresh_tokens)

        auth_client = AuthClient(client_id=CLIENT_ID, authorizer=authorizer)

        authorizer = RefreshTokenAuthorizer(
            transfer_tokens['refresh_token'],
            auth_client,
            access_token=transfer_tokens['access_token'],
            expires_at=transfer_tokens['expires_at_seconds'],
            on_refresh=refresh_tokens)

        transfer_client = TransferClient(authorizer=authorizer)

        self._auth_client = auth_client
        self._transfer_client = transfer_client

    @staticmethod
    def _load_tokens_from_file(filepath):
        """Load a set of saved tokens."""
        with open(filepath, 'r') as f:
            tokens = json.load(f)

        return tokens

    @staticmethod
    def _save_tokens_to_file(filepath, tokens):
        """Save a set of tokens for later use."""
        with open(filepath, 'w') as f:
            json.dump(tokens, f)

    def _update_tokens_file_on_refresh(self, token_response):
        """
        Callback function passed into the RefreshTokenAuthorizer.
        Will be invoked any time a new access token is fetched.
        """
        self._save_tokens_to_file(TOKEN_FILE_PATH, token_response.by_resource_server)

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

    def get_endpoint_id(self, endpoint_name):
        print("My Endpoints:")
        found = None
        for ep in self._transfer_client.endpoint_search(filter_scope="my-endpoints"):
            print(ep["display_name"])
            if ep["display_name"] == endpoint_name:
                found = ep
        if found:
            return found['id']
        return None

    def get_globus_user(self, user_name):
        ret = self._auth_client.get_identities(usernames=[user_name])
        globus_user = None
        if ret and ret['identities'] and len(ret['identities']) > 0:
            globus_user = ret['identities'][0]
        return globus_user

    def get_endpoint(self, endpoint_id):
        return self._transfer_client.get_endpoint(endpoint_id)

    def set_acl_rule(self, ep_id, path, globus_user_id, permissions):
        results = self._transfer_client.endpoint_acl_list(ep_id)
        for rule in results["DATA"]:
            if rule['path'] == path and rule['principal'] == globus_user_id:
                return rule
        rule_data = {
            "DATA_TYPE": "access",
            "principal_type": "identity",
            "principal": globus_user_id,
            "path": path,
            "permissions": permissions
        }
        results = self._transfer_client.add_endpoint_acl_rule(ep_id, rule_data)
        if not results['code'] == "Created":
            return None
        results = self._transfer_client.endpoint_acl_list(ep_id)
        for rule in results["DATA"]:
            if rule['path'] == path and rule['principal'] == globus_user_id:
                return rule
        return None