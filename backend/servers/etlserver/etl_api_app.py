import os
import logging
import json
import pkg_resources
from flask import Flask, request
from flask_api import status
from werkzeug.utils import secure_filename

from .DatabaseInterface import DatabaseInterface
from .globus_etl.task_library import startup_and_verify
from .globus_etl.BuildProjectExperiment import BuildProjectExperiment
from . import access

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

@app.route('/globus/stage', methods=['POST'])
@apikey
def stage_background_excel_upload():
    log.debug("/globus/stage - starting")
    user_id = access.get_user()
    j = request.get_json(force=True)
    experiment_name = j["name"]
    experiment_description = j["description"]
    project_id = j["project_id"]
    globus_endpoint = j["globus_uuid"]
    excel_file_path = j["globus_excel_file"]
    data_dir_path = j["globus_data_dir"]
    log.debug("/globus/stage - args - user_id = {}".format(user_id))
    log.debug("/globus/stage - args - project_id = {}".format(project_id))
    log.debug("/globus/stage - args - experiment_name = {}".format(experiment_name))
    log.debug("/globus/stage - args - experiment_description = {}".format(experiment_description))
    log.debug("/globus/stage - args - globus_endpoint = {}".format(globus_endpoint))
    log.debug("/globus/stage - args - excel_file_path = {}".format(excel_file_path))
    log.debug("/globus/stage - args - data_dir_path = {}".format(data_dir_path))
    results = startup_and_verify(user_id, project_id, experiment_name, experiment_description,
                                 globus_endpoint, excel_file_path, data_dir_path)
    log.debug("/globus/stage - done {}".format(results))
    return format_as_json_return(results)


@app.route('/globus/monitor', methods=['POST'])
@apikey
def monitor_background_excel_upload():
    log.debug("/globus/monitor - starting")
    j = request.get_json(force=True)
    log.debug("Results as json = {}".format(j))
    status_record_id = None
    status_record = {
        "status": "Fail",
        "reason": "Status record unavailable",
        "status_record_id": None
    }
    try:
        status_record_id = j['status_record_id']
        log.debug("status_record_id = {}".format(status_record_id))
        status_record = {
            "status": "Fail",
            "reason": "Status record unavailable",
            "status_record_id": status_record_id
        }
        if status_record_id:
            status_record = DatabaseInterface().get_status_record(status_record_id)
            del status_record['birthtime']
            del status_record['mtime']
    except KeyError as ke:
        status_record = {
            "status": "Fail",
            "reason": "Failed to get status_record_id from request",
            "status_record_id": None
        }
    status_recored_json = format_as_json_return(status_record)
    log.debug("return as json = {}".format(status_recored_json))
    log.debug("/globus/monitor - done")
    return status_recored_json


@app.route('/upload', methods=['POST'])
@apikey
def upload_file():
    log.info("etl file upload - starting - new test")
    name = request.form.get('name')
    project_id = request.form.get("project_id")
    description = request.form.get("description")
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
    try:
        builder = BuildProjectExperiment()
        builder.set_rename_is_ok(True)
        builder.preset_project_id(project_id)
        builder.preset_experiment_name_description(name, description)
        log.debug("etl file upload - build starting...")
        builder.build(file_path, None)
        log.info("etl file upload - done")
        return format_as_json_return({"project_id": project_id})
    except Exception as e:
        log.info("Unexpected exception...", exc_info=True)
        message = str(e)
        return message, status.HTTP_500_INTERNAL_SERVER_ERROR

class UploadUtility:
    def __init__(self):
        self.log = logging.getLogger(__name__ + "." + self.__class__.__name__)
        self.log.info("Starting UploadUtility")

    @staticmethod
    def allowed_file(filename):
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

    def get_file(self):
        # noinspection PyUnusedLocal
        try:
            self.log.info("Starting get_file")
            upload_folder = '/tmp/upload'
            self.log.info("upload_folder = {}".format(upload_folder))
            if not os.path.exists(upload_folder):
                message = "etl file upload - no upload folder: " + upload_folder
                self.log.info(message)
                return message, status.HTTP_503_SERVICE_UNAVAILABLE
            # check if the post request has the file part
            if 'file' not in request.files:
                message = "etl file upload - no file"
                self.log.info(message)
                return message, status.HTTP_400_BAD_REQUEST
            file = request.files['file']
            # if user does not select file, browser also
            # submits a empty part without filename
            if file.filename == '':
                message = "etl file upload - empty file"
                self.log.info(message)
                return message, status.HTTP_400_BAD_REQUEST
            name = request.form.get('name')
            project_id = request.form.get("project_id")
            description = request.form.get("description")
            self.log.info("etl file upload - request data")
            self.log.info(name)
            self.log.info(project_id)
            self.log.info(description)
            if not name:
                message = "etl file upload - experiment name missing, required"
                self.log.info(message)
                return message, status.HTTP_400_BAD_REQUEST
            if not project_id:
                message = "etl file upload - project_id missing, required"
                self.log.info(message)
                return message, status.HTTP_400_BAD_REQUEST
            if not self.allowed_file(file.filename):
                message = "etl file upload - wrong file extension, must be '*.xlsx'"
                message += ": " + file.filename
                self.log.info("etl file upload - file accepted")
            filename = secure_filename(file.filename)
            file_path = os.path.join(upload_folder, filename)
            file.save(file_path)
            self.log.info("etl file upload - done")
            return file_path, None
        except Exception as e:
            self.log.info("Unexpected exception...", exc_info=True)
            message = str(e)
            return message, status.HTTP_500_INTERNAL_SERVER_ERROR