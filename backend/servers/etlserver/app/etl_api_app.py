import json
import logging

import pkg_resources
from flask import Flask, request
from flask_api import status

from servers.etlserver.database.DatabaseInterface import DatabaseInterface
from servers.etlserver.database.DB import DbConnection
from servers.etlserver.download.GlobusDownload import GlobusDownload, DOWNLOAD_NO_FILES_FOUND
from servers.etlserver.user import access
from servers.etlserver.user.api_key import apikey
from servers.etlserver.utils.ConfClientHelper import ConfClientHelper
from servers.etlserver.common.GlobusInfo import GlobusInfo
from servers.etlserver.common.MaterialsCommonsGlobusInterface import MaterialsCommonsGlobusInterface
from servers.etlserver.app.AppHelper import AppHelper

log = logging.getLogger(__name__)

log.info("Starting Flask with {}".format(__name__.split('.')[0]))

app = Flask(__name__.split('.')[0])


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


@app.route('/project/etlexcelfiles', methods=['POST'])
@apikey
def project_excel_files_for_etl():
    log.info("project_excel_files_for_etl")
    j = request.get_json(force=True)
    log.info("project_excel_files_for_etl: data in = {}".format(j))
    project_id = j['project_id']
    api_key = request.args.get('apikey', default="no_such_key")
    user_id = access.get_user()
    log.info("  project_id = {}".format(project_id))
    log.info("  api_key = {}".format(api_key))
    log.info("  user_id = {}".format(user_id))
    if not project_id:
        message = "Project-based ETL - project_id missing, required"
        log.error(message)
        return message, status.HTTP_400_BAD_REQUEST
    file_list = AppHelper(api_key).get_project_excel_files(project_id)
    ret_value = {"file_list": file_list}
    ret = format_as_json_return(ret_value)
    log.info("project_excel_files_for_etl: returns {}".format(ret))
    return ret


@app.route('/project/etl', methods=['POST'])
@apikey
def project_based_etl():
    try:
        log.info("project_based_etl")
        j = request.get_json(force=True)
        log.info("project_based_etl: data in = {}".format(j))
        project_id = j['project_id']
        excel_file_path = j['file_path']
        experiment_name = j['experiment_name']
        experiment_desc = j['experiment_desc']
        api_key = request.args.get('apikey', default="no_such_key")
        user_id = access.get_user()
        log.info("  project_id = {}".format(project_id))
        log.info("  excel_file_path = {}".format(excel_file_path))
        log.info("  experiment_name = {}".format(experiment_name))
        log.info("  experiment_desc = {}".format(experiment_desc))
        log.info("  api_key = {}".format(api_key))
        log.info("  user_id = {}".format(user_id))
        if not project_id:
            message = "Project-based ETL - project_id missing, required"
            log.error(message)
            return message, status.HTTP_400_BAD_REQUEST
        if not experiment_name:
            message = "Project-based ETL - experiment_name missing, required"
            log.error(message)
            return message, status.HTTP_400_BAD_REQUEST
        ret_value = AppHelper(api_key).run_project_based_etl(
           project_id, excel_file_path, experiment_name, experiment_desc)
        ret = format_as_json_return(ret_value)
        return ret
    except BaseException as e:
        message = "{}".format(e)
        log.exception(e, message)
        return message, status.HTTP_400_BAD_REQUEST


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


@app.route('/globus/upload/status', methods=['POST'])
@apikey
def globus_upload_status():
    j = request.get_json(force=True)
    project_id = j["project_id"]
    api_key = request.args.get('apikey', default="no_such_key")
    return_value = AppHelper(api_key).get_project_globus_upload_status(project_id)
    log.info(return_value)
    return format_as_json_return(return_value)


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
