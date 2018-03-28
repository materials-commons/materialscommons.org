import json
import pkg_resources
from flask import Flask, request
from flask_api import status

from .DB import DbConnection
from .api_key import apikey
from .util import msg as util_msg

from materials_commons.etl.input_spreadsheet import BuildProjectExperiment

app = Flask(__name__.split('.')[0])

import os
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = '/tmp/test-uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {'xlsx'}


from materials_commons.api import _use_remote as use_remote

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
    util_msg("Done.")
    return format_as_json_return({"project_id": builder.project.id})

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/upload', methods=['POST'])
def upload_file():
    util_msg("etl file upload - starting")
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        message = "etl file upload - no upload folder"
        util_msg(message)
        return message, status.HTTP_503_SERVICE_UNAVAILABLE
    # check if the post request has the file part
    if 'file' not in request.files:
        message = "etl file upload - no file"
        util_msg(message)
        return message, status.HTTP_400_BAD_REQUEST
    file = request.files['file']
    # if user does not select file, browser also
    # submits a empty part without filename
    if file.filename == '':
        message = "etl file upload - empty file"
        util_msg(message)
        return message, status.HTTP_400_BAD_REQUEST
    name = request.form.get('name')
    project_id = request.form.get("project_id")
    description = request.form.get("description")
    util_msg("etl file upload - request data")
    util_msg(name)
    util_msg(project_id)
    util_msg(description)
    if not name:
        message = "etl file upload - experiment name missing, required"
        util_msg(message)
        return message, status.HTTP_400_BAD_REQUEST
    if not project_id:
        message = "etl file upload - project_id missing, required"
        util_msg(message)
        return message, status.HTTP_400_BAD_REQUEST
    if file and allowed_file(file.filename) and name and project_id:
        util_msg("etl file upload - file accepted")
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        util_msg("etl file upload - file saved to " + file_path)
        builder = BuildProjectExperiment()
        builder.set_rename_is_ok(True)
        builder.preset_project_id(project_id)
        builder.preset_experiment_name_description(name, description)
        util_msg("etl file upload - build starting...")
        builder.build(file_path, None)
        util_msg("etl file upload - done")
        return format_as_json_return({"project_id": builder.project.id})
    util_msg("etl file upload - file type not accepted")
    return {"argh": "file type not accepted"}

