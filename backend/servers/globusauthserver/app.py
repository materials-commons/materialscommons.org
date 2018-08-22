import logging
import os
import json
from flask import Flask, redirect, url_for, request, flash, session

import globus_sdk

from servers.etlserver.database.DB import DbConnection
from servers.etlserver.user import access
from servers.etlserver.user.api_key import apikey

from .decorators import authenticated


log = logging.getLogger(__name__)
log.info("Starting Flask with {}".format(__name__.split('.')[0]))

app = Flask(__name__.split('.')[0])
app.config['SECRET_KEY'] = "blah blah"
app.config['SERVER_NAME'] = 'localhost:5880'
app.config['GLOBUS_AUTH_LOGOUT_URI'] = 'https://auth.globus.org/v2/web/logout'


_MC_CC_ID = os.environ.get('MC_CONFIDENTIAL_CLIENT_USER')
_MC_CC_PW = os.environ.get('MC_CONFIDENTIAL_CLIENT_PW')


def format_as_json_return(what):
    return json.dumps(what, indent=4)


@app.before_request
def before_request():
    DbConnection().set_connection()


@app.teardown_request
def teardown_request(exception):
    DbConnection().close_connection()
    if exception:
        pass


@app.route('/')
def home():
    log.info("home landing")

    if not session.get('user_id'):
        session['user_id'] = "unknown"
    user_id = session.get('user_id')

    log.info("User id = {}".format(user_id))

    if not session.get('is_authenticated'):
        session['is_authenticated'] = False
    log.info("Is authenticated: {}".format(session.get('is_authenticated')))
    return format_as_json_return({"hello": user_id, "authorized": session.get('is_authenticated')})


@app.route('/login', methods=['GET'])
@apikey
def login():
    """Send the user to Globus Auth."""
    session['user_id'] = access.get_user()

    log.info("Request for login")

    return redirect(url_for('globus_auth_callback'))


@app.route('/globus_auth_callback', methods=['GET'])
def globus_auth_callback():
    """Handles the interaction with Globus Auth."""
    log.info("Request for authcallback")

    # If we're coming back from Globus Auth in an error state, the error
    # will be in the "error" query string parameter.
    if 'error' in request.args:
        flash("You could not be logged into the portal: " +
              request.args.get('error_description', request.args['error']))
        return redirect(url_for('home'))

    # Set up our Globus Auth/OAuth2 state
    redirect_uri = url_for('globus_auth_callback', _external=True)
    log.info("Redirect for return call = {}".format(redirect_uri))

    log.info("Using MC Conf Client: {}".format(_MC_CC_ID))

    client = globus_sdk.ConfidentialAppAuthClient(_MC_CC_ID, _MC_CC_PW)
    client.oauth2_start_flow(redirect_uri, refresh_tokens=True)

    # If there's no "code" query string parameter, we're in this route
    # starting a Globus Auth login flow.
    if 'code' not in request.args:

        auth_uri = client.oauth2_get_authorize_url()
        log.info("Auth UIR = {}".format(auth_uri))
        return redirect(auth_uri)

    else:
        # If we do have a "code" param, we're coming back from Globus Auth
        # and can start the process of exchanging an auth code for a token.
        code = request.args.get('code')
        tokens = client.oauth2_exchange_code_for_tokens(code)

        id_token = tokens.decode_id_token(client)
        session.update(
            tokens=tokens.by_resource_server,
            is_authenticated=True,
            name=id_token.get('name', ''),
            email=id_token.get('email', ''),
            institution=id_token.get('institution', ''),
            primary_username=id_token.get('preferred_username'),
            primary_identity=id_token.get('sub'),
        )
        return redirect(url_for('home'))


@app.route('/logout', methods=['GET'])
@apikey
@authenticated
def logout():
    """
    - Revoke the tokens with Globus Auth.
    - Destroy the session state.
    - Redirect the user to the Globus Auth logout page.
    """
    client = globus_sdk.ConfidentialAppAuthClient(_MC_CC_ID, _MC_CC_PW)

    # Revoke the tokens with Globus Auth
    if session.get('tokens'):
        for token, token_type in (
                (token_info[ty], ty)
                # get all of the token info dicts
                for token_info in session['tokens'].values()
                # cross product with the set of token types
                for ty in ('access_token', 'refresh_token')
                # only where the relevant token is actually present
                if token_info[ty] is not None):
            client.oauth2_revoke_token(
                token, additional_params={'token_type_hint': token_type})

    # Destroy the session state
    session.clear()

    redirect_uri = url_for('home', _external=True)

    ga_logout_url = []
    ga_logout_url.append(app.config['GLOBUS_AUTH_LOGOUT_URI'])
    ga_logout_url.append('?client={}'.format(_MC_CC_ID))
    ga_logout_url.append('&redirect_uri={}'.format(redirect_uri))
    ga_logout_url.append('&redirect_name=Globus Sample Data Portal')

    # Redirect the user to the Globus Auth logout page
    return redirect(''.join(ga_logout_url))

