from mcapp import app
from decorators import crossdomain, apikey, jsonp
from flask import request
import rethinkdb as r
from utils import error_response
import dmutil

@app.route('/v1.0/processes/<process_id>', methods=['GET'])
@jsonp
def get_process(process_id):
    return dmutil.get_single_from_table('processes', process_id)

@app.route('/v1.0/processes', methods=['GET'])
@jsonp
def get_all_processes():
    return dmutil.get_all_from_table('processes')

#
# TODO: Fix up error_response(400) to something meaningful
# TODO: Where should we get user from (remove from request args?)
@app.route('/v1.0/processes/new', methods=['POST'])
@apikey
@crossdomain(origin='*')
def create_process():
    p = dict()
    j = request.get_json()
    p['name'] = dmutil.get_required('name', j)
    user = request.args.get('user', None)
    if user is None:
        return error_response(400)
    p['owner'] = user

    p['project'] = dmutil.get_required('project', j)
    #
    # Check validity of project. When process is created
    #
    p['birthtime'] = r.now()
    p['mtime'] = p['birthtime']
    p['machine'] = dmutil.get_optional('machine', j)
    p['process_type'] = dmutil.get_required('process_type', j)
    p['description'] = dmutil.get_required('description', j)
    p['version'] = dmutil.get_optional('version', j)
    p['notes'] = dmutil.get_optional('notes', j, [])
    p['input_conditions'] = dmutil.get_optional('input_conditions', j, [])
    p['input_files'] = dmutil.get_optional('input_files', j, [])
    p['output_conditions'] = dmutil.get_optional('output_conditions', j, [])
    p['output_files'] = dmutil.get_optional('output_files', j, [])
    p['runs'] = dmutil.get_optional('runs', j, [])
    p['citations'] = dmutil.get_optional('citations', j, [])
    p['status'] = dmutil.get_optional('status', j)
    return dmutil.insert_entry('processes', p)

@app.route('/v1.0/processes/from_template', methods=['POST'])
@apikey
@crossdomain(origin='*')
def create_process_from_template():
    p = dict()
    j = request.get_json()
    p['template'] = dmutil.get_required('id', j)
    p['project'] = dmutil.get_required('project', j)
    m = j['model']
    p['name'] = dmutil.get_required_prop('name', m)
    p['birthtime'] = r.now()
    p['mtime'] = p['birthtime']
    p['machine'] = dmutil.get_optional_prop('machine', m)
    p['process_type'] = dmutil.get_required_prop('process_type', m)
    p['description'] = dmutil.get_required_prop('description', m)
    p['version'] = dmutil.get_optional_prop('version', m)
    p['notes'] = dmutil.get_optional_prop('notes', m, [])
    p['input_conditions'] = dmutil.get_optional_prop('input_conditions', m, [])
    p['input_files'] = dmutil.get_optional_prop('input_files', m, [])
    p['output_conditions'] = dmutil.get_optional_prop('output_conditions', m, [])
    p['output_files'] = dmutil.get_optional_prop('output_files', m, [])
    p['runs'] = dmutil.get_optional_prop('runs', m, [])
    p['citations'] = dmutil.get_optional_prop('citations', m, [])
    p['status'] = dmutil.get_optional_prop('status', m)
    return dmutil.insert_entry('processes', p)

@app.route('/v1.0/process/<process_id>', methods=['PUT'])
@apikey
@crossdomain(origin='*')
def update_process(process_id):
    pass
