from mcapp import app
from decorators import crossdomain, apikey, jsonp
from flask import request
import rethinkdb as r
import error
import dmutil
import access

@app.route('/processes/<process_id>', methods=['GET'])
@jsonp
def get_process(process_id):
    return dmutil.get_single_from_table('processes', process_id)

@app.route('/processes', methods=['GET'])
@jsonp
def get_all_processes():
    return dmutil.get_all_from_table('processes')

@app.route('/processes/new', methods=['POST'])
@apikey
@crossdomain(origin='*')
def create_process():
    p = dict()
    j = request.get_json()
    p['name'] = dmutil.get_required('name', j)
    user = access.get_user()
    p['owner'] = user
    p['project'] = dmutil.get_required('project', j)
    if not dmutil.item_exists('projects', p['project']):
        return error.not_acceptable("Unknown project id: %s" % (p['project']))
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
