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

@app.route('/v1.0/user/<user>/udqueue')
@apikey
@jsonp
def get_udqueue(user):
    selection = list(r.table('udqueue').filter({'owner':user}).run(g.conn))
    return json_as_format_arg(selection)

@app.route('/v1.0/user/<user>/upload', methods=['POST'])
@apikey
@crossdomain(origin='*')
def upload_file(user):
    process_id = request.form['process_id']
    project_id = request.form['project_id']
    tdir = tempfile.mkdtemp(dir='/tmp/uploads')
    mkdirp('/tmp/uploads')
    for key in request.files.keys():
        datadir = request.form[key + "_datadir"]
        file = request.files[key]
        dir = os.path.join(tdir, datadir)
        mkdirp(dir)
        filepath = os.path.join(dir, file.filename)
        file.save(filepath)
    chain(load_data_dir.si(user, tdir, project_id, process_id)\
          | import_data_dir_to_repo.si(tdir))()
    return jsonify({'success': True})

@app.route('/v1.0/user/<user>/download/file/<path:datafile>')
#@apikey
def download_file(user, datafile):
    return send_from_directory('/tmp', 'ReviewQueue.png', as_attachment=True)
    #df = r.table('datafiles').get(datafile).run(g.conn)
    #if not checkAccess(user, df):
    #   return error_not_found_response()
    #return None
