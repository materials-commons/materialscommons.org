import os
import logging
import json
import pkg_resources
from flask import Flask, request
from flask_api import status
from werkzeug.utils import secure_filename

from materials_commons.etl.input_spreadsheet import BuildProjectExperiment
# noinspection PyProtectedMember
from materials_commons.api import _use_remote as use_remote

from .DB import DbConnection
from .api_key import apikey

log = logging.getLogger(__name__)

log.debug("Starting Flask with {}".format(__name__.split('.')[0]))

app = Flask(__name__.split('.')[0])
ALLOWED_EXTENSIONS = {'xlsx'}


def format_as_json_return(what):
    if 'format' in request.args:
        return json.dumps(what, indent=4)
    else:
        return json.dumps(what)


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
        "version": pkg_resources.get_distribution("materials_commons").version
    })


@app.route('/test')
@apikey
def setup_test():
    remote = use_remote()
    return format_as_json_return({
        "url": remote.config.mcurl,
        "apikey": remote.config.mcapikey
    })


@app.route('/fixed')
@apikey
def upload_fixed_spreadsheet():
    builder = BuildProjectExperiment()
    builder.set_rename_is_ok(True)
    builder.build("/Users/weymouth/Desktop/input.xlsx", None)
    log.debug("Done.")
    return format_as_json_return({"project_id": builder.project.id})


@app.route('/globus/stage', methods=['POST'])
def stage_background_excel_upload():
    log.info("/globus/stage - starting")
    log.info("/globus/stage - stub")
    j = request.get_json(force=True)
    name = j["name"]
    description = j["description"]
    project_id = j["project_id"]
    globus_uuid = j["globus_uuid"]
    globus_excel_file = j["globus_excel_file"]
    globus_data_dir = j["globus_data_dir"]
    log.info("/globus/stage - done")
    return format_as_json_return({'status': 'PROCESSING'})


@app.route('/globus/monitor', methods=['POST'])
def monitor_background_excel_upload():
    log.debug("/globus/monitor - starting")
    log.debug("/globus/monitor - stub")
    log.debug("/parts/monitor - done")
    return format_as_json_return({'status': 'PROCESSING'})


@app.route('/upload', methods=['POST'])
def upload_file():
    log.debug("etl file upload - starting")
    name = request.form.get('name')
    project_id = request.form.get("project_id")
    description = request.form.get("description")
    log.debug(name)
    log.debug(project_id)
    log.debug(description)
    if not name:
        message = "etl file upload - experiment name missing, required"
        log.debug(message)
        return message, status.HTTP_400_BAD_REQUEST
    if not project_id:
        message = "etl file upload - project_id missing, required"
        log.debug(message)
        return message, status.HTTP_400_BAD_REQUEST
    log.debug("etl file upload - getting file")
    uploader = UploadUtility()
    (message_or_ret, http_status) = uploader.get_file()
    if http_status:
        return message_or_ret, http_status
    file_path = message_or_ret
    log.debug("etl file upload - file saved to " + file_path)
    builder = BuildProjectExperiment()
    builder.set_rename_is_ok(True)
    builder.preset_project_id(project_id)
    builder.preset_experiment_name_description(name, description)
    log.debug("etl file upload - build starting...")
    builder.build(file_path, None)
    log.debug("etl file upload - done")
    return format_as_json_return({"project_id": builder.project.id})


class UploadUtility:
    def __init__(self):
        pass

    @staticmethod
    def allowed_file(filename):
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

    def get_file(self):
        # noinspection PyUnusedLocal
        upload_folder = app.config['UPLOAD_FOLDER']
        if not os.path.exists(app.config['UPLOAD_FOLDER']):
            message = "etl file upload - no upload folder: " + app.config['UPLOAD_FOLDER']
            log.debug(message)
            return message, status.HTTP_503_SERVICE_UNAVAILABLE
        # check if the post request has the file part
        if 'file' not in request.files:
            message = "etl file upload - no file"
            log.debug(message)
            return message, status.HTTP_400_BAD_REQUEST
        file = request.files['file']
        # if user does not select file, browser also
        # submits a empty part without filename
        if file.filename == '':
            message = "etl file upload - empty file"
            log.debug(message)
            return message, status.HTTP_400_BAD_REQUEST
        name = request.form.get('name')
        project_id = request.form.get("project_id")
        description = request.form.get("description")
        log.debug("etl file upload - request data")
        log.debug(name)
        log.debug(project_id)
        log.debug(description)
        if not name:
            message = "etl file upload - experiment name missing, required"
            log.debug(message)
            return message, status.HTTP_400_BAD_REQUEST
        if not project_id:
            message = "etl file upload - project_id missing, required"
            log.debug(message)
            return message, status.HTTP_400_BAD_REQUEST
        if not self.allowed_file(file.filename):
            message = "etl file upload - wrong file extension, must be '*.xlsx'"
            message += ": " + file.filename
        log.debug("etl file upload - file accepted")
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        log.debug("etl file upload - done")
        return file_path, None
