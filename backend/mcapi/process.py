from mcapp import app
from decorators import crossdomain, apikey, jsonp
from flask import request, g
import rethinkdb as r
import error
import dmutil
import access
import args


@app.route('/processes/<process_id>', methods=['GET'])
@apikey(shared=True)
@jsonp
def get_process(process_id):
    user = access.get_user()
    process = dmutil.get_single_from_table('processes', process_id, raw=True)
    if process is None:
        return error.bad_request("Unknown process")
    access.check(user, process['owner'])
    return args.json_as_format_arg(process)


@app.route('/processes/template/<template_id>', methods=['GET'])
@apikey
@jsonp
def get_all_processes_for_template(template_id):
    rr = r.table('processes').filter({'template': template_id})
    selection = list(rr.run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)


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


@app.route('/processes/project/<project_id>', methods=['GET'])
@apikey
@jsonp
def get_all_processes_for_project(project_id):
    rr = r.table('processes').filter({'project': project_id}) \
                             .pluck('id', 'name', 'template', 'description')
    selection = list(rr.run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)


@app.route('/process/update/<path:processid>', methods=['PUT'])
@apikey
@crossdomain(origin='*')
def update_process(processid):
    rv = r.table('processes').get(processid).update(request.json).run(g.conn)
    if (rv['replaced'] == 1 or rv['unchanged'] == 1):
        return ''
    else:
        error.update_conflict("Unable to update process: " + processid)
        

@app.route('/processes/sample/<sample_id>', methods=['GET'])
@jsonp
def get_processes_for_sample(sample_id):
    rv = r.table('conditions').get_all(sample_id, index='value') \
                              .eq_join('process_id', r.table('processes'))
    selection = list(rv.run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)
