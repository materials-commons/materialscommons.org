from mcapp import app
from decorators import crossdomain, apikey, jsonp
from flask import request, g
import rethinkdb as r
import error
import dmutil
import access
from args import add_all_arg_options, json_as_format_arg


@app.route('/processes/<process_id>', methods=['GET'])
@jsonp
def get_process(process_id):
    return dmutil.get_single_from_table('processes', process_id)

@app.route('/processes', methods=['GET'])
@jsonp
def get_all_processes():
    return dmutil.get_all_from_table('processes')


@app.route('/processes/template/<template_id>', methods=['GET'])
@jsonp
def get_all_processes_for_template(template_id):
    rr = r.table('processes').filter({'template': template_id})
    selection = list(rr.run(g.conn, time_format='raw'))
    return json_as_format_arg(selection)


@app.route('/processes/new', methods=['POST'])
@apikey
@crossdomain(origin='*')
def create_process():
    p = dict()
    j = request.get_json()
    print j
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
@jsonp
def get_all_processes_for_project(project_id):
    rr = r.table('processes').filter({'project': project_id}).pluck('id', 'name','template', 'description')
    selection = list(rr.run(g.conn, time_format='raw'))
    return  json_as_format_arg(selection)

@app.route('/processes/extract/<process_id>/<object_type>', methods=['GET'])
@apikey
@jsonp
def get_datafile_objects(process_id, object_type):
    rr = r.table('processes').filter({'id': process_id})
    if object_type == 'input_files':
        rr = rr.outer_join(r.table('datafiles').pluck('id', 'name','size', 'owner', 'birthtime'),
                       lambda ddrow, drow: ddrow['input_files']
                       .contains(drow['id']))
    elif object_type == 'output_files':
        rr = rr.outer_join(r.table('datafiles').pluck('id', 'name','size', 'owner', 'birthtime'),
                       lambda ddrow, drow: ddrow['output_files']
                       .contains(drow['id']))
    elif object_type == 'input_conditions':
        rr = rr.outer_join(r.table('conditions'),
                       lambda ddrow, drow: ddrow['input_conditions']
                       .contains(drow['id']))
    elif object_type == 'output_conditions':
        rr = rr.outer_join(r.table('conditions'),
                       lambda ddrow, drow: ddrow['output_conditions']
                       .contains(drow['id']))
    selection = list(rr.run(g.conn, time_format='raw'))
    print selection
    return  json_as_format_arg(selection)


