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
#, load_data_file
from celery import chain
from .. import access
from .. import error
from .. import dmutil
from loader.model import datafile

@app.route('/udqueue')
@apikey
@jsonp
def get_udqueue():
    user = access.get_user()
    selection = list(r.table('udqueue').filter({'owner':user}).run(g.conn))
    return json_as_format_arg(selection)

@app.route('/upload', methods=['POST'])
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

@app.route('/import', methods=['POST'])
@apikey
@crossdomain(origin='*')
def import_file():
    print "import_file"
    user = access.get_user()
    print "about to do request.form"
    for key in request.files.keys():
        print "request.files key = %s" %(key)
    print request.form
    print request.files
    if 'file' not in request.files:
        print "no files to import"
        return error.bad_request("No files to import")
    elif 'project' not in request.form:
        print "no project"
        return error.bad_request('No project specified')
    elif 'datadir' not in request.form:
        print "no datadir"
        return error.bad_request('No datadir specified')
    print "getting project"
    project = request.form['project']
    datadir = request.form['datadir']
    mkdirp('/tmp/uploads')
    print "calling request.files"
    file = request.files['file']
    print "Printing files for file"
    #print file.read()
    print "calling make_datafile"
    dfid = make_datafile(datadir, user, file.filename)
    filepath = os.path.join('/tmp/uploads', dfid)
    print "filepath = %s" % (filepath)
    file.save(filepath)
    print "Wrote file to path %s" % (filepath)
    #load_data_file.delay(df, project, datadir)
    return jsonify({'id': dfid})

def make_datafile(datadir, user, filename):
    print "make_datafile: datadir %s, %s, %s" %(datadir, user, filename)
    df = datafile.DataFile(filename, "private", user)
    print "   1"
    dfid = dmutil.insert_entry_id('datafiles', df.__dict__)
    print "   2"
    ddir = r.table('datadirs').get(datadir).run(g.conn)
    print "   3"
    dfiles = ddir['datafiles']
    dfiles.append(dfid)
    print "   4"
    r.table('datadirs').get(datadir).update({'datafiles': dfiles}).run(g.conn)
    print "   5"
    return dfid

@app.route('/download/<path:datafile>')
#@apikey
def download_file(datafile):
    user = access.get_user()
    return send_from_directory('/tmp', 'ReviewQueue.png', as_attachment=True)
    #df = r.table('datafiles').get(datafile).run(g.conn)
    #if not checkAccess(user, df):
    #   return error_not_found_response()
    #return None
