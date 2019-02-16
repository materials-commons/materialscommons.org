import json
import logging

import pkg_resources
from flask import Flask, request, Response as flask_response
from flask_api import status

from servers.etlserver.database.DB import DbConnection
from servers.etlserver.download.GlobusDownload import GlobusDownload, DOWNLOAD_NO_FILES_FOUND
from servers.etlserver.user import access
from servers.etlserver.user.api_key import apikey
from servers.etlserver.utils.ConfClientHelper import ConfClientHelper
from servers.etlserver.common.GlobusInfo import GlobusInfo
from servers.etlserver.app.AppHelper import AppHelper
from servers.etlserver.utils.UploadUtility import UploadUtility

log = logging.getLogger(__name__)

log.info("Starting Flask with {}".format(__name__.split('.')[0]))

app = Flask(__name__.split('.')[0])


def format_as_json_return(what):
    return flask_response(json.dumps(what), mimetype="application/json")


@app.before_request
def before_request():
    DbConnection().set_connection()


@app.teardown_request
def teardown_request(exception):
    DbConnection().close_connection()
    if exception:
        pass


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


@app.route('/upload', methods=['POST'])
@apikey
def etl_only_upload_file():
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
    # noinspection PyBroadException
    try:
        log.info("etl file upload - getting file")
        uploader = UploadUtility()
        (message_or_ret, http_status) = uploader.get_file()
        if http_status:
            return message_or_ret, http_status
        file_path = message_or_ret
        log.info("etl file upload - file saved to " + file_path)
        AppHelper(api_key).run_excel_file_only_etl(project_id, file_path, name, description)
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


@app.route('/globus/upload/status', methods=['POST'])
@apikey
def globus_upload_status():
    # noinspection PyBroadException
    try:
        j = request.get_json(force=True)
        project_id = j["project_id"]
        api_key = request.args.get('apikey', default="no_such_key")
        user_id = access.get_user()
        log.info("In app level: Request for globus upload status")
        return_value = AppHelper(api_key).get_project_globus_upload_status(user_id, project_id)
        return_value = {
            "value": return_value
        }
        log.info("In app level return_value = {}".format(return_value))
        return format_as_json_return(return_value)
    except Exception:
        message = "Globus upload status - unexpected exception"
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
