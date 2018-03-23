import json

from flask import Flask, request, redirect

from .DB import DbConnection
from .api_key import apikey
from .util import msg as util_msg

from .elt.input_spreadsheet import BuildProjectExperiment

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


@app.route('/uploadtest', methods=['GET', 'POST'])
def upload_file():
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        return {"status": "error", "Message": "No upload folder: system misconfigured"}
    if request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in request.files:
            return redirect(request.url)
        file = request.files['file']
        # if user does not select file, browser also
        # submit a empty part without filename
        if file.filename == '':
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            builder = BuildProjectExperiment()
            builder.set_rename_is_ok(True)
            builder.build(file_path, None)
            util_msg("Done.")
            return format_as_json_return({"project_id": builder.project.id})

    apikey_value =
    return '''
    <!doctype html>
    <title>Upload new File</title>
    <h1>Upload new File</h1>
    <form method=post enctype=multipart/form-data>
        <input type=hidden name=apikey value='$'
         <input type=file name=file>
         <input type=submit value=Upload>
    </form>
    '''

