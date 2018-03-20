import pkg_resources
from os import environ
import json

import rethinkdb as r
from rethinkdb.errors import RqlDriverError, ReqlError
from flask import Flask, g, abort, request
from globus_service import MaterialsCommonsGlobusInterface

from decorators import apikey
import access
import dmutil

_MCDB = "materialscommons"
_MCDB_HOST = environ.get('MCDB_HOST') or 'localhost'
_MCDB_PORT = environ.get('MCDB_PORT') or 28015

app = Flask(__name__.split('.')[0])


def mcdb_connect():
    return r.connect(host=_MCDB_HOST, port=_MCDB_PORT, db=_MCDB)


def format_as_json_return(what):
    if 'format' in request.args:
        return json.dumps(what, indent=4)
    else:
        return json.dumps(what)


@app.before_request
def before_request():
    if 'rethinkdb_version' not in g:
        version = pkg_resources.get_distribution("rethinkdb").version[0:4]
        g.rethinkdb_version = int(version.replace('.', ''))
    try:
        g.conn = mcdb_connect()
    except RqlDriverError:
        abort(503, "Database connection could not be established")


@app.teardown_request
def teardown_request():
    try:
        g.conn.close()
    except ReqlError:
        pass


@app.route('/mcglobus/version', methods=['GET'])
@apikey
def return_version_information():
    user = access.get_user()
    web_service = MaterialsCommonsGlobusInterface(user)
    results = {
        "version": web_service.version
    }
    return format_as_json_return(results)


@app.route('/mcglobus/upload', methods=['POST'])
@apikey
def mc_globus_stage_upload():
    user = access.get_user()
    post_data = request.get_json()

    dmutil.msg("mc_globus_stage_upload: user = " + user)
    # required args
    project_id = dmutil.get_required('project_id', post_data)
    endpoint_uuid = dmutil.get_required('user_endpoint_id', post_data)

    # optional args
    project_path = dmutil.get_optional('project_directory_path', post_data, novalue="/")
    endpoint_path = dmutil.get_optional('user_endpoint_path', post_data, novalue="/")

    dmutil.msg("mc_globus_stage_upload: project_id = " + project_id)
    dmutil.msg("mc_globus_stage_upload: endpoint_uuid = " + endpoint_uuid)
    dmutil.msg("mc_globus_stage_upload: project_path = " + project_path)
    dmutil.msg("mc_globus_stage_upload: endpoint_path = " + endpoint_path)

    dmutil.msg("init service")
    web_service = MaterialsCommonsGlobusInterface(user)
    dmutil.msg("set_transfer_client")
    results = web_service.set_transfer_client()
    if results['status'] == 'error':
        return format_as_json_return(results['error'])

    # dmutil.msg("stage_upload_files")
    # results = web_service.stage_upload_files(project_id, endpoint_uuid, project_path, endpoint_path)
    # args.format = True
    results = {"error": "not working"}
    return format_as_json_return(results)


@app.route('/mcglobus/upload/status/<task_id>', methods=['GET'])
@apikey
def mc_globus_get_upload_task_status(task_id):
    user = access.get_user()
    web_service = MaterialsCommonsGlobusInterface(user)
    results = web_service.set_transfer_client()
    if results['status'] == 'error':
        return format_as_json_return(results['error'])
    results = web_service.get_task_status(task_id)
    return format_as_json_return(results)
