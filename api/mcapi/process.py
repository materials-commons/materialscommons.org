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

@app.route('/v1.0/processes', methods=['POST'])
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
    p['birthtime'] = r.now()
    p['mtime'] = p['birthtime']
    p['machine'] = dmutil.get_required('machine', j)
    if not dmutil.entry_exists('machines', p['machine']):
        return error_response(400)
    p['process_type'] = dmutil.get_required('process_type', j)
    p['description'] = dmutil.get_required('description', j)
    p['parent'] = dmutil.get_optional('parent', j)
    p['version'] = dmutil.get_optional('version', j)
    p['notes'] = dmutil.get_optional('notes', j, [])
    p['inputs'] = dmutil.get_optional('inputs', j, [])
    p['outputs'] = dmutil.get_optional('outputs', j, [])
    p['runs'] = dmutil.get_optional('runs', j, [])
    p['citations'] = dmutil.get_optional('citations', j, [])
    p['status'] = dmutil.get_optional('status', j)
    return dmutil.insert_entry('processes', p)

@app.route('/v1.0/process/<process_id>', methods=['PUT'])
@apikey
@crossdomain(origin='*')
def update_process(process_id):
    pass
