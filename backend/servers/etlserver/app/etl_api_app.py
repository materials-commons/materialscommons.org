import logging
import json
import os
import pkg_resources
from flask import Flask, request
from flask_api import status

from servers.etlserver.globus_etl_upload.etl_task_library import startup_and_verify
from servers.etlserver.globus.BuildProjectExperimentWithETL import BuildProjectExperiment
from servers.etlserver.database.DatabaseInterface import DatabaseInterface
from servers.etlserver.database.DB import DbConnection
from servers.etlserver.download.GlobusDownload import GlobusDownload, DOWNLOAD_NO_FILES_FOUND
from servers.etlserver.globus_non_etl_upload.non_etl_task_library import non_etl_startup_and_verify
from servers.etlserver.user import access
from servers.etlserver.user.api_key import apikey
from servers.etlserver.utils.UploadUtility import UploadUtility
from servers.etlserver.utils.ConfClientHelper import ConfClientHelper
from servers.etlserver.common.GlobusInfo import GlobusInfo
from servers.etlserver.common.MaterialsCommonsGlobusInterface import MaterialsCommonsGlobusInterface
from servers.etlserver.globus.GlobusMonitor import GlobusMonitor

log = logging.getLogger(__name__)

log.info("Starting Flask with {}".format(__name__.split('.')[0]))

app = Flask(__name__.split('.')[0])
app.config['GLOBUS_AUTH_LOGOUT_URI'] = 'https://auth.globus.org/v2/web/logout'


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
def hello_world():
    return format_as_json_return({"hello": "world"})


@app.route('/version')
def get_version():
    return format_as_json_return({
        "python_api_version": pkg_resources.get_distribution("materials_commons").version
    })


@app.route('/globus/stage', methods=['POST'])
@apikey
def stage_background_excel_upload():
    log.info("/globus/stage - starting")
    user_id = access.get_user()
    j = request.get_json(force=True)
    experiment_name = j["name"]
    experiment_description = j["description"]
    project_id = j["project_id"]
    globus_endpoint = j["globus_uuid"]
    globus_base_path = j["globus_base_path"]
    excel_file_path = j["globus_excel_file"]
    data_dir_path = j["globus_data_dir"]
    log.info("/globus/stage - args - user_id = {}".format(user_id))
    log.info("/globus/stage - args - project_id = {}".format(project_id))
    log.info("/globus/stage - args - experiment_name = {}".format(experiment_name))
    log.info("/globus/stage - args - experiment_description = {}".format(experiment_description))
    log.info("/globus/stage - args - globus_endpoint = {}".format(globus_endpoint))
    log.info("/globus/stage - args - globus_base_path = {}".format(globus_base_path))
    log.info("/globus/stage - args - excel_file_path = {}".format(excel_file_path))
    log.info("/globus/stage - args - data_dir_path = {}".format(data_dir_path))
    results = startup_and_verify(user_id, project_id, experiment_name, experiment_description,
                                 globus_endpoint, globus_base_path,
                                 excel_file_path, data_dir_path)
    log.info("/globus/stage - done {}".format(results))
    return format_as_json_return(results)


@app.route('/globus/monitor', methods=['POST'])
@apikey
def monitor_background_excel_upload():
    log.info("/globus/monitor - starting")
    j = request.get_json(force=True)
    log.info("Results as json = {}".format(j))
    try:
        status_record_id = j['status_record_id']
        log.info("status_record_id = {}".format(status_record_id))
        status_record = {
            "status": "Fail",
            "reason": "Status record unavailable",
            "status_record_id": status_record_id
        }
        if status_record_id:
            status_record = DatabaseInterface().get_status_record(status_record_id)
            del status_record['birthtime']
            del status_record['mtime']
    except KeyError:
        status_record = {
            "status": "Fail",
            "reason": "Failed to get status_record_id from request",
            "status_record_id": None
        }
    status_record_json = format_as_json_return(status_record)
    log.info("return as json = {}".format(status_record_json))
    log.info("/globus/monitor - done")
    return status_record_json


@app.route('/project/status', methods=['POST'])
@apikey
def get_background_status_for_project():
    ret = "{}"
    # noinspection PyBroadException
    try:
        log.info("get_background_status_for_project")
        j = request.get_json(force=True)
        log.info("get_background_status_for_project: data in = {}".format(j))
        project_id = j['project_id']
        log.info("get_background_status_for_project: project_id = {}".format(project_id))
        status_list = DatabaseInterface().get_status_by_project_id(project_id)
        log.info("get_background_status_for_project: status_list = {}".format(status_list))
        status_record = None
        if status_list:
            status_record = {
                'status': status_list[0]['status'],
                'id': status_list[0]['id']
            }
        ret_value = {'status': status_record}
        ret = format_as_json_return(ret_value)
        log.info("get_background_status_for_project: ret = {}".format(ret))
    except Exception:
        log.info("Unexpected exception...", exc_info=True)
    return ret


@app.route('/upload', methods=['POST'])
@apikey
def upload_file():
    log.info("etl-only; no data file upload - starting")
    api_key = request.args.get('apikey', default="no_such_key")
    name = request.form.get('name')
    project_id = request.form.get("project_id")
    description = request.form.get("description")
    log.info(api_key)
    log.info(name)
    log.info(project_id)
    log.info(description)
    if not name:
        message = "etl file upload - experiment name missing, required"
        log.info(message)
        return message, status.HTTP_400_BAD_REQUEST
    if not project_id:
        message = "etl file upload - project_id missing, required"
        log.info(message)
        return message, status.HTTP_400_BAD_REQUEST
    log.info("etl file upload - getting file")
    uploader = UploadUtility()
    (message_or_ret, http_status) = uploader.get_file()
    if http_status:
        return message_or_ret, http_status
    file_path = message_or_ret
    log.info("etl file upload - file saved to " + file_path)
    # noinspection PyBroadException
    try:
        builder = BuildProjectExperiment(api_key)
        builder.set_rename_is_ok(True)
        builder.preset_project_id(project_id)
        builder.preset_experiment_name_description(name, description)
        log.info("etl file upload - build starting...")
        builder.build(file_path, None)
        log.info("etl file upload - done")
        return format_as_json_return({"project_id": project_id})
    except Exception as e:
        log.info("Unexpected exception...", exc_info=True)
        message = str(e)
        return message, status.HTTP_500_INTERNAL_SERVER_ERROR


@app.route('/globus/transfer/download', methods=['POST'])
@apikey
def globus_transfer_download():
    log.info("Project top-level directory staged for transfer with Globus - starting")
    api_key = request.args.get('apikey', default="no_such_key")
    user_id = access.get_user()
    j = request.get_json(force=True)
    project_id = j["project_id"]
    log.info("Download Project id = {}".format(project_id))
    # noinspection PyBroadException
    try:
        download = GlobusDownload(user_id, api_key, project_id)
        url = download.download()
        if url == DOWNLOAD_NO_FILES_FOUND:
            ret_value = {'error': 'No files were found; download aborted'}
        else:
            ret_value = {'url': url}
        ret = format_as_json_return(ret_value)
        return ret
    except Exception:
        message = "Download transfer with Globus - unexpected exception"
        log.exception(message)
        return message, status.HTTP_400_BAD_REQUEST


@app.route('/globus/transfer/upload', methods=['POST'])
@apikey
def globus_transfer_upload():
    log.info("Project upload shared endpoint to top-level directory with Globus - starting")
    j = request.get_json(force=True)
    project_id = j["project_id"]
    globus_endpoint_id = j["endpoint"]
    globus_endpoint_path = j["path"]
    user_id = access.get_user()
    log.info("Project id = {}; Globus user name = {}".format(project_id, globus_endpoint_id))
    if not globus_endpoint_id:
        message = "Project upload with Globus - globus_endpoint_id is missing, required"
        log.error(message)
        return message, status.HTTP_400_BAD_REQUEST
    if not globus_endpoint_path:
        message = "Project upload with Globus - globus_endpoint_path is missing, required"
        log.error(message)
        return message, status.HTTP_400_BAD_REQUEST
    if not project_id:
        message = "Project upload with Globus - project_id missing, required"
        log.error(message)
        return message, status.HTTP_400_BAD_REQUEST
    # noinspection PyBroadException
    try:
        results = non_etl_startup_and_verify(user_id, project_id, globus_endpoint_id, globus_endpoint_path)
        log.info("Project id = {}; Globus user name = {}".format(project_id, results))
        ret = format_as_json_return(results)
        return ret
    except Exception:
        message = "Download transfer with Globus - unexpected exception"
        log.exception(message)
        return message, status.HTTP_400_BAD_REQUEST


@app.route('/globus/transfer/info', methods=['GET'])
@apikey
def globus_transfer_info():
    log.info("Globus background task list - starting")
    # noinspection PyBroadException
    try:
        source = GlobusInfo()
        returned_info = source.get_all()
        for key in returned_info:
            log.info("Details from info: {} = {}".format(key, returned_info[key]))
        ret = format_as_json_return(returned_info)
        return ret
    except Exception:
        message = "Info for transfers with Globus - unexpected exception"
        log.exception(message)
        return message, status.HTTP_400_BAD_REQUEST


@app.route('/globus/transfer/status', methods=['POST'])
@apikey
def globus_transfer_status():
    log.info("Globus background task list - starting")
    j = request.get_json(force=True)
    project_id = j["project_id"]
    log.info("Project id = {}".format(project_id))
    if not project_id:
        message = "Project upload with Globus - project_id missing, required"
        log.error(message)
        return message, status.HTTP_400_BAD_REQUEST
    # noinspection PyBroadException
    try:
        status_list = DatabaseInterface().get_status_by_project_id(project_id, limit=10)
        return_list = []
        for record in status_list:
            return_list.append(
                {
                    'timestamp': int(record['birthtime'].timestamp()),
                    'name': record['name'],
                    'queue': record['queue'],
                    'status': record['status']
                }
            )
        ret_value = {'status_list': return_list}
        ret = format_as_json_return(ret_value)
        log.info("get_background_status_for_project: ret = {}".format(ret))
        return ret
    except Exception:
        message = "Status of previous transfers with Globus - unexpected exception"
        log.exception(message)
        return message, status.HTTP_400_BAD_REQUEST


@app.route('/globus/transfer/admin/info', methods=['GET', 'POST'])
@apikey
def globus_transfer_admin_info():
    log.info("Globus background admin task list - starting")
    user_id = access.get_user()
    if not access.is_administrator(user_id):
        message = "User is not admin"
        log.exception(message)
        return message, status.HTTP_401_UNAUTHORIZED

    # noinspection PyBroadException
    try:
        source = GlobusInfo()
        returned_info = source.get_all()
        for key in returned_info:
            log.info("Details from info: {} = {}".format(key, returned_info[key]))
        ret = format_as_json_return(returned_info)
        return ret
    except Exception:
        message = "Admin info for transfers with Globus - unexpected exception"
        log.exception(message)
        return message, status.HTTP_400_BAD_REQUEST


@app.route('/globus/transfer/admin/status', methods=['GET', 'POST'])
@apikey
def globus_transfer_admin_status():
    log.info("Globus transfer admin status - starting")
    user_id = access.get_user()
    if not access.is_administrator(user_id):
        message = "User is not admin"
        log.exception(message)
        return message, status.HTTP_401_UNAUTHORIZED

    # noinspection PyBroadException
    try:
        source = GlobusMonitor()
        returned_info = source.get_background_process_status_list()
        ret = format_as_json_return(returned_info)
        return ret
    except Exception:
        message = "Admin status for transfers with Globus - unexpected exception"
        log.exception(message)
        return message, status.HTTP_400_BAD_REQUEST


@app.route('/globus/transfer/admin/cctasks', methods=['GET', 'POST'])
@apikey
def globus_transfer_admin_cctasks():
    log.info("Globus transfer admin cc tasks - starting")
    user_id = access.get_user()
    if not access.is_administrator(user_id):
        message = "User is not admin"
        log.exception(message)
        return message, status.HTTP_401_UNAUTHORIZED

    # noinspection PyBroadException
    try:
        cchelper = ConfClientHelper()
        cchelper.setup(full=True)
        returned_info = []
        for item in cchelper.monitor_list:
            returned_info.append(item.data)
        ret = format_as_json_return(returned_info)
        return ret
    except Exception:
        message = "Globus transfer admin cc tasks - unexpected exception"
        log.exception(message)
        return message, status.HTTP_400_BAD_REQUEST


@app.route('/globus/auth/status', methods=['GET', 'POST'])
@apikey
def globus_auth_status():
    # get tokens - if they exist
    # validate tokens
    # return authentication-state, globus user, globus id

    user_id = access.get_user()
    client = MaterialsCommonsGlobusInterface(user_id).get_auth_client()

    # tokens
    log.info("Getting Globus Auth status for user = {}".format(user_id))
    record_list = DatabaseInterface().get_globus_auth_info_records_by_user_id(user_id)
    # use only the latest
    record = (record_list[0] if len(record_list) > 0 else None)
    log.info("Globus Auth record = {}".format(record))
    tokens = None
    globus_name = None
    globus_id = None
    if record:
        tokens = record['tokens']
        globus_name = record['globus_name']
        globus_id = record['globus_id']

    # validate
    validated = {}
    types = ['auth.globus.org', 'transfer.api.globus.org']
    for token_type in types:
        if tokens and token_type in tokens:
            log.info(client.oauth2_validate_token(tokens[token_type]))
            refresh_value = client.oauth2_validate_token(tokens[token_type]['refresh_token'])
            access_value = client.oauth2_validate_token(tokens[token_type]['access_token'])
            seconds = tokens[token_type]['expires_at_seconds']
            validated[token_type] = {
                'refresh': refresh_value['active'],
                'access': access_value['active'],
                'expires': seconds
            }
        else:
            validated[token_type] = {
                'refresh': False,
                'access': False,
                'expires': 0
            }

    globus_authentication = \
        ('auth.globus.org' in validated) \
        and validated['auth.globus.org']['access']

    return_status = {
        'globus_name': globus_name,
        'globus_id': globus_id,
        'authenticated': globus_authentication,
        'validated': validated
    }

    return format_as_json_return({'status': return_status})


@app.route('/globus/auth/login', methods=['GET', 'POST'])
@apikey
def globus_auth_login_url():
    user_id = access.get_user()
    # Set up our Globus Auth/OAuth2 state
    redirect_uri = os.environ.get("MC_GLOBUS_AUTH_CALLBACK")
    log.info("Redirect for return call = {}".format(redirect_uri))

    if not redirect_uri:
        message = "The environmental variable  MC_GLOBUS_AUTH_CALLBACK is not set; "
        message += "Globus login will not work."
        log.error(message)
        return message, status.HTTP_401_UNAUTHORIZED

    client = MaterialsCommonsGlobusInterface(user_id).get_auth_client()
    client.oauth2_start_flow(redirect_uri, state=user_id, refresh_tokens=True)
    auth_uri = client.oauth2_get_authorize_url()
    log.info("Auth UIR = {}".format(auth_uri))

    return format_as_json_return({'url': auth_uri})


@app.route('/globus/auth/callback', methods=['GET'])
def globus_auth_callback():
    log.info("-------------------------------------------------")
    log.info("Starting globus_auth_callback")
    log.info("-------------------------------------------------")
    # If there's no "code" query string parameter something is wrong
    if 'code' not in request.args:
        # If we're coming back from Globus Auth in an error state, the error
        # will be in the "error" query string parameter.
        if 'error' in request.args:
            message = "Login request failed: {}".format(request.args['error'])
            log.error(message)
#            session['login_status'] = 'error'
#            session['is_authenticated'] = 'false'
#            session['error_message'] = message
            return message, status.HTTP_401_UNAUTHORIZED
        else:
            message = "This service is for globus auth return only"
            log.error(message)
            return message, status.HTTP_401_UNAUTHORIZED

    else:
        # The only legitimate 'call' to this url is Globus Auth callback.

        # If we do have a "code" param, we're coming back from Globus Auth
        # and can start the process of exchanging an auth code for a token.

        # Set up our Globus Auth/OAuth2 state
        user_id = request.args.get('state')
        if not user_id:
            message = "The 'state' parameters was not set; expected a user_id"
            log.error(message)
            #            session['login_status'] = 'error'
            #            session['is_authenticated'] = 'false'
            #            session['error_message'] = message
            return message, status.HTTP_401_UNAUTHORIZED

        redirect_uri = os.environ.get("MC_GLOBUS_AUTH_CALLBACK")
        log.info("Redirect for return call = {}".format(redirect_uri))

        client = MaterialsCommonsGlobusInterface(user_id).get_auth_client()
        client.oauth2_start_flow(redirect_uri, refresh_tokens=True)
        code = request.args.get('code')
        log.info("-------------------------------------------------")
        log.info("Before call to get tokens; code = {}".format(code))
        log.info("-------------------------------------------------")
        tokens = client.oauth2_exchange_code_for_tokens(code)
        log.info("-------------------------------------------------")
        log.info("After call to get tokens; tokens = {}".format(tokens))
        log.info("-------------------------------------------------")

        id_token = tokens.decode_id_token()
        log.info("Returned as from globus auth:")
        log.info("  name = {}".format(id_token.get('name', '')))
        log.info("  email = {}".format(id_token.get('email', '')))
        log.info("  institution = {}".format(id_token.get('institution', '')))
        log.info("  primary_username = {}".format(id_token.get('preferred_username')))
        log.info("  primary_identity = {}".format(id_token.get('sub')))
        log.info("  tokens = {}".format(tokens.by_resource_server))
        log.info(DatabaseInterface().create_globus_auth_info(
            user_id,
            id_token.get('preferred_username'),
            id_token.get('sub'),
            tokens.by_resource_server))
    return 'You Should be logged in - return to Materials Commons page/tab and refresh.'


@app.route('/globus/auth/logout', methods=['GET', 'POST'])
@apikey
def globus_auth_logout():
    """
    - Revoke the tokens with Globus Auth.
    - Remove any auth records in database.
    - Return Globus logout URL
    """
    user_id = access.get_user()
    log.info("Globus Auth logout for user = {}".format(user_id))
    client = MaterialsCommonsGlobusInterface(user_id).get_auth_client()
    auth_records = DatabaseInterface().get_globus_auth_info_records_by_user_id(user_id)
    log.info("Auth records{}".format(auth_records))
    if auth_records:
        for record in auth_records:
            for token, token_type in (
                    (token_info[ty], ty)
                    # get all of the token info dicts
                    for token_info in record['tokens'].values()
                    # cross product with the set of token types
                    for ty in ('access_token', 'refresh_token')
                    # only where the relevant token is actually present
                    if token_info[ty] is not None):
                client.oauth2_revoke_token(
                    token, additional_params={'token_type_hint': token_type})

    # Destroy the session state - normally, only one
    if auth_records:
        for record in auth_records:
            log.info("Deleting Globus Auth record with id = {}".format(record['id']))
            DatabaseInterface().delete_globus_auth_info_record(record['id'])

    # noinspection PyListCreation
    ga_logout_url = []
    ga_logout_url.append(app.config['GLOBUS_AUTH_LOGOUT_URI'])
    ga_logout_url.append('?client={}'.format(client.client_id))

    # This link to the Globus Auth logout page
    return format_as_json_return({'url': ''.join(ga_logout_url)})
