from ..mcapp import app
from ..decorators import crossdomain, apikey, jsonp
from flask import jsonify, g, request, send_from_directory
from ..utils import mkdirp
import rethinkdb as r
import os.path
import os
from ..args import json_as_format_arg
import tempfile
from loader.tasks.db import load_data_dir, import_data_dir_to_repo
from celery import chain
from .. import access
from .. import error
from .. import dmutil
from .. import validate
from .. import mcdir
from loader.model import datafile


@app.route('/udqueue')
@apikey
@jsonp
def get_udqueue():
    user = access.get_user()
    selection = list(r.table('udqueue').filter({'owner': user}).run(g.conn))
    return json_as_format_arg(selection)


@app.route('/upload12', methods=['POST'])
@apikey
@crossdomain(origin='*')
def upload_file():
    user = access.get_user()
    state_id = request.form['state_id']
    mkdirp('/tmp/uploads')
    tdir = tempfile.mkdtemp(dir='/tmp/uploads')
    for key in request.files.keys():
        datadir = request.form[key + "_datadir"]
        file = request.files[key]
        dir = os.path.join(tdir, datadir)
        mkdirp(dir)
        filepath = os.path.join(dir, file.filename)
        file.save(filepath)
    chain(load_data_dir.si(user, tdir, state_id)\
          | import_data_dir_to_repo.si(tdir))()
    return jsonify({'success': True})


@app.route('/upload', methods=['POST'])
@apikey
@crossdomain(origin='*')
def upload_file_1():
    user = access.get_user()
    j = request.get_json()
    state_id = dmutil.get_required('state_id', j)
    #load_data_dir_1(user, state_id)
    return jsonify({'success': True})


@app.route('/import', methods=['POST'])
@apikey
@crossdomain(origin='*')
def import_file():
    user = access.get_user()
    if 'file' not in request.files:
        return error.bad_request("No files to import")
    elif 'project' not in request.form:
        return error.bad_request('No project specified')
    elif 'datadir' not in request.form:
        return error.bad_request('No datadir specified')
    project = request.form['project']
    datadir = request.form['datadir']
    file = request.files['file']
    proj = validate.project_id_exists(project, user)
    if proj is None:
        return error.bad_request("Project doesn't exist %s" % (project))
    ddir = validate.datadir_id_exists(datadir, user)
    if ddir is None:
        return error.bad_request(
            "Datadir doesn't exist %s" % (datadir))
    if not datadir_in_project(ddir, proj):
        return error.bad_request(
            "Datadir %s is not in project %s" % (datadir, project))
    if filename_in_datadir(ddir, file.filename):
        return error.bad_request(
            "File %s already exists in datadir %s" % (file.filename, datadir))
    dfid = make_datafile(datadir, user, file.filename)
    filepath = os.path.join(mcdir.for_uid(dfid), dfid)
    file.save(filepath)
    #load_data_file.delay(df, project, datadir)
    return jsonify({'id': dfid})


def datadir_in_project(ddir, proj):
    filter_by = {'project_id': proj['id'], 'datadir_id': ddir['id']}
    selection = list(r.table('project2datadir').filter(filter_by).run(g.conn))
    if selection:
        return True
    return False


def filename_in_datadir(ddir, filename):
    files = list(r.table('datafiles').filter({'name': filename}).run(g.conn))
    if not files:
        return False
    for file in files:
        for ddir_id in file['datadirs']:
            if ddir_id == ddir['id']:
                return True
    return False


def make_datafile(datadir, user, filename):
    df = datafile.DataFile(os.path.basename(filename), "private", user)
    df.datadirs.append(datadir)
    dfid = dmutil.insert_entry_id('datafiles', df.__dict__)
    ddir = r.table('datadirs').get(datadir).run(g.conn)
    dfiles = ddir['datafiles']
    dfiles.append(dfid)
    r.table('datadirs').get(datadir).update({'datafiles': dfiles}).run(g.conn)
    return dfid


@app.route('/download/<path:datafile>')
#@apikey
def download_file(datafile):
    #user = access.get_user()
    return send_from_directory('/tmp', 'ReviewQueue.png', as_attachment=True)
    #df = r.table('datafiles').get(datafile).run(g.conn)
    #if not checkAccess(user, df):
    #   return error_not_found_response()
    #return None
