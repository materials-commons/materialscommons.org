import json

from flask import Flask, request
from globus_service import MaterialsCommonsGlobusInterface

from DB import DbConnection
from api_key import apikey
import access
import util

app = Flask(__name__.split('.')[0])


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
        raise exception


@app.route('/')
def hello_world():
    return format_as_json_return({"hello": "world"})


@app.route('/version', methods=['GET'])
@apikey
def return_version_information():
    user = access.get_user()
    web_service = MaterialsCommonsGlobusInterface(user)
    results = {
        "version": web_service.version
    }
    return format_as_json_return(results)


@app.route('/upload', methods=['POST'])
@apikey
def mc_globus_stage_upload():
    user = access.get_user()
    post_data = request.get_json()

    util.msg("mc_globus_stage_upload: user = " + user)
    # required args
    project_id = util.get_required('project_id', post_data)
    endpoint_uuid = util.get_required('user_endpoint_id', post_data)

    # optional args
    project_path = util.get_optional('project_directory_path', post_data, novalue="/")
    endpoint_path = util.get_optional('user_endpoint_path', post_data, novalue="/")

    util.msg("mc_globus_stage_upload: project_id = " + project_id)
    util.msg("mc_globus_stage_upload: endpoint_uuid = " + endpoint_uuid)
    util.msg("mc_globus_stage_upload: project_path = " + project_path)
    util.msg("mc_globus_stage_upload: endpoint_path = " + endpoint_path)

    util.msg("init service")
    web_service = MaterialsCommonsGlobusInterface(user)
    util.msg("set_transfer_client")
    results = web_service.set_transfer_client()
    if results['status'] == 'error':
        return format_as_json_return(results['error'])

    util.msg("stage_upload_files")
    results = web_service.stage_upload_files(project_id, endpoint_uuid, project_path, endpoint_path)
    return format_as_json_return(results)


@app.route('/upload/status/<task_id>', methods=['GET'])
@apikey
def mc_globus_get_upload_task_status(task_id):
    user = access.get_user()
    web_service = MaterialsCommonsGlobusInterface(user)
    results = web_service.set_transfer_client()
    if results['status'] == 'error':
        return format_as_json_return(results['error'])
    results = web_service.get_task_status(task_id)
    return format_as_json_return(results)
