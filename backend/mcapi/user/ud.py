from ..mcapp import app
from ..decorators import crossdomain, apikey, jsonp
from flask import jsonify, g, request, send_from_directory
from ..utils import mkdirp
import rethinkdb as r
import os.path
import os
from ..args import json_as_format_arg
import tempfile
from .. import access
from .. import error
from .. import dmutil
from .. import validate
from .. import mcdir
from loader.model import datafile
from mcapi import mcexceptions
import traceback


class StateCreateSaver(object):
    def __init__(self):
        self.objects = {}


    def insert(self, table, entry):
        rv = r.table('saver').insert(entry).run(g.conn)
        id = rv['generated_keys'][0]
        self.objects[id] = table
        return id

    def insert_newval(self, table, entry):
        rv = r.table('saver').insert(entry, return_vals=True).run(g.conn)
        id = rv['generated_keys'][0]
        self.objects[id] = table
        return rv

    def move_to_tables(self):
        for key in self.objects:
            table_name = self.objects[key]
            o = r.table('saver').get(key).run(g.conn, time_format='raw')
            r.table(table_name).insert(o).run(g.conn)

    def delete_tables(self):
        for key in self.objects:
            r.table('saver').get(key).delete().run(g.conn)
        self.objects.clear()


@app.route('/udqueue')
@apikey
@jsonp
def get_udqueue():
    user = access.get_user()
    selection = list(r.table('udqueue').filter({'owner': user}).run(g.conn))
    return json_as_format_arg(selection)


@app.route('/upload', methods=['POST'])
@apikey
@crossdomain(origin='*')
def upload_state():
    user = access.get_user()
    j = request.get_json()
    state_id = dmutil.get_required('state_id', j)
    process_id = load_data_dir(user, state_id)
    if (process_id):
        return jsonify({'success': True, 'process': process_id})
    else:
        return error.bad_request('unable to create process')


def load_data_dir(user, state_id):
    state_saver = StateCreateSaver()
    try:
        process_id = load_data(user, state_id,state_saver)
        return process_id
    except mcexceptions.RequiredAttributeException as rae:
        traceback.print_exc()
        state_saver.delete_tables()
        print "Missing attribute: %s" % (rae.attr)
    except Exception as exc:
        traceback.print_exc()
        state_saver.delete_tables()
        raise load_data_dir.retry(exc=exc)
    finally:
        state_saver.delete_tables()


def load_data(user, state_id, state_saver):
    process_id = load_provenance_from_state(state_id, state_saver)
    r.table('drafts').get(state_id).delete().run(g.conn)
    state_saver.move_to_tables()
    state_saver.delete_tables()
    return process_id
    

def load_provenance_from_state(state_id, saver):
    state = r.table('drafts').get(state_id).run(g.conn)
    attributes = state['attributes']
    user = state['owner']
    project_id = attributes['project_id']
    saver.project_id = project_id
    create_process_from_template(attributes['process'], saver)
    process_id = saver.process_id
    if 'input_files' in attributes:
        r.table('saver').get(process_id).update({'input_files': attributes['input_files']}).run(g.conn)
    if 'output_files' in attributes:
        r.table('saver').get(process_id).update({'output_files': attributes['output_files']}).run(g.conn)
    input_conditions = dmutil.get_optional('input_conditions', attributes, [])
    output_conditions = dmutil.get_optional('output_conditions', attributes, [])
    create_conditions_from_templates_modified(process_id, user, input_conditions, output_conditions, saver)
    return process_id


def create_process_from_template(j, saver):
    project_id = saver.project_id
    p = dict()
    p['project'] = project_id
    p['name'] = dmutil.get_required('name', j)
    p['birthtime'] = r.now()
    p['mtime'] = p['birthtime']
    p['machine'] = dmutil.get_optional('machine', j)
    p['process_type'] = dmutil.get_optional('process_type', j)
    p['description'] = dmutil.get_optional('description', j)
    p['version'] = dmutil.get_optional('version', j)
    p['template'] = dmutil.get_required('template', j)
    p['notes'] = dmutil.get_optional('notes', j, [])
    p['input_conditions'] = dmutil.get_optional('input_conditions', j, [])
    p['input_files'] = dmutil.get_optional('input_files', j, [])
    p['output_conditions'] = dmutil.get_optional('output_conditions', j, [])
    p['output_files'] = dmutil.get_optional('output_files', j, [])
    p['runs'] = dmutil.get_optional('runs', j, [])
    p['citations'] = dmutil.get_optional('citations', j, [])
    p['status'] = dmutil.get_optional('status', j)
    process_id = saver.insert('processes', p)
    saver.process_id = process_id
    saver.insert('project2processes', {'project_id': project_id, 'process_id': process_id})



def create_conditions_from_templates(process_id, user, input_conditions, output_conditions, saver):
    for condition_name in input_conditions:
        condition = input_conditions[condition_name]
        condition[u'condition_type'] = 'input_conditions'
        create_condition_from_template_modified(process_id, user, condition, saver)
    for condition_name in output_conditions:
        condition = output_conditions[condition_name]
        condition[u'condition_type'] = 'output_conditions'
        create_condition_from_template_modified(process_id, user, condition, saver)


def create_condition_from_template(process_id, user, j, saver):
    c = dict()
    m = j['model']
    type_of_condition = dmutil.get_required('condition_type', j)
    c['owner'] = user
    c['material'] = dmutil.get_optional('material', j)
    c['template'] = dmutil.get_required('id', j)
    c['name'] = dmutil.get_required('name', j) #dmutil.get_required('template_name', j) = every condition instance should have its own name
    c['description'] = dmutil.get_optional('description', j)
    c['model'] = list()
    for attr in m:
        add_model_item(c, attr['name'],attr['value'], attr['unit'], attr['value_choice'],attr['unit_choice'],attr['type'])
        #c[attr['name']] = attr['value']
    c_id = saver.insert('conditions', c)
    new_conditions = r.table('saver').get(process_id)[type_of_condition].append(c_id).run(g.conn)
    r.table('saver').get(process_id).update({type_of_condition:new_conditions}).run(g.conn)

def add_model_item(c, name, value,unit, value_choice, unit_choice,value_type):
    c['model'].append({'name':name, 'value':value,'unit':unit, 'value_choice':value_choice, 'unit_choice':unit_choice, 'type':value_type})


def create_conditions_from_templates_modified(process_id, user, input_conditions, output_conditions, saver):
    for key  in input_conditions:
        values = input_conditions[key]
        values['condition_type'] = 'input_conditions'
        create_condition_from_template_modified(process_id, user, values, saver)
    for key  in output_conditions:
        values = output_conditions[key]
        values['condition_type'] = 'output_conditions'
        create_condition_from_template_modified(process_id, user, values, saver)


def create_condition_from_template_modified(process_id, user, j, saver):
    c = dict()
    type_of_condition = dmutil.get_required('condition_type', j)
    c['owner'] = dmutil.get_optional('owner', j)
    c['material'] = dmutil.get_optional('material', j)
    c['model'] = dmutil.get_optional('model', j)
    c['template'] = dmutil.get_required('template_name', j)
    c['sample_id'] = dmutil.get_optional('sample_id', j)
    c_id = saver.insert('conditions', c)
    new_conditions = r.table('saver').get(process_id)[type_of_condition].append(c_id).run(g.conn)
    r.table('saver').get(process_id).update({type_of_condition:new_conditions}).run(g.conn)


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



