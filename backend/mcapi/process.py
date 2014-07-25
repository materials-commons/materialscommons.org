from mcapp import app
from decorators import crossdomain, apikey, jsonp
from flask import request, g
import rethinkdb as r
import error
import dmutil
import access
import args
import json

class DEncoder2(json.JSONEncoder):
    def default(self, o):
        return o.__dict__
    
@app.route('/processes/<process_id>', methods=['GET'])
@apikey(shared=True)
@jsonp
def get_process(process_id):
    user = access.get_user()
    process = dmutil.get_single_from_table('processes', process_id, raw=True)
    if process is None:
        return error.bad_request("Unknown process")
    access.check(user, process['owner'])
    result = build_sample_file_objects(process, '')
    return args.json_as_format_arg(result)


@app.route('/processes/template/<template_id>', methods=['GET'])
@apikey
@jsonp
def get_all_processes_for_template(template_id):
    rr = r.table('processes').filter({'template': template_id})
    selection = list(rr.run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)


@app.route('/processes/project/<project_id>', methods=['GET'])
@apikey
@jsonp
def get_processes_by_project(project_id):
    rr = r.table('processes').get_all(project_id, index='project')
    selection = list(rr.run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)


@app.route('/processes/sample/<sample_id>', methods=['GET'])
@apikey
@jsonp
def get_processes_by_sample(sample_id):
    rr = r.table('samples_denorm').get_all(sample_id, index='sample_id')
    selection = list(rr.run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)


@app.route('/processes/file/<file_id>', methods=['GET'])
@jsonp
def get_processes_by_file(file_id):
    rv = r.table('datafiles_denorm').filter({'df_id': file_id}).eq_join('process_id', r.table('processes')).zip()
    selection = list(rv.run(g.conn, time_format='raw'))
    result = build_sample_file_objects(selection, 'array')
    return args.json_as_format_arg(result)

def build_sample_file_objects(selection, type):
    sample_list = []
    file_list = []
    samples_objs = []
    file_objs = []
    if type == "array":
        for s in selection:
        #get_all_sample_ids
            inputs = s['inputs']
            outputs = s['outputs']
            for i in inputs:
                if i['attribute'] == 'sample':
                    sample_list.append(i['properties']['id']['value'])
                elif i['attribute'] == 'file':
                    file_list.append(i['properties']['id']['value'])
            for o in outputs:
                if o['attribute'] == 'sample':
                    sample_list.append(o['properties']['id']['value'])
                elif o['attribute'] == 'file':
                    file_list.append(o['properties']['id']['value'])
        if len(sample_list) != 0:
            rr = r.table('samples').get_all(*sample_list)
            sample_objs = list(rr.run(g.conn, time_format='raw'))
        if len(file_list) != 0:
            rr = r.table('datafiles').get_all(*file_list)
            file_objs = list(rr.run(g.conn, time_format='raw'))
        #stick the objects 
        for s in selection:
            #get_all_sample_ids
            for i in inputs:
                if i['attribute'] == 'sample':
                    i['properties']['obj'] = get_an_item(i['properties']['id']['value'], sample_objs)
                elif i['attribute'] == 'file':
                    file_list.append(i['properties']['id']['value'])
                    i['properties']['obj'] = get_an_item(i['properties']['id']['value'], file_objs)
            for o in outputs:
                if o['attribute'] == 'sample':
                    o['properties']['obj'] = get_an_item(o['properties']['id']['value'], sample_objs)
                elif o['attribute'] == 'file':
                    file_list.append(o['properties']['id']['value'])
                    o['properties']['obj'] = get_an_item(o['properties']['id']['value'], file_objs)
        return selection    
    else:
        s = selection
        inputs = s['inputs']
        outputs = s['outputs']
        for i in inputs:
            if i['attribute'] == 'sample':
                sample_list.append(i['properties']['id']['value'])
            elif i['attribute'] == 'file':
                    file_list.append(i['properties']['id']['value'])
            for o in outputs:
                if o['attribute'] == 'sample':
                    sample_list.append(o['properties']['id']['value'])
                elif o['attribute'] == 'file':
                    file_list.append(o['properties']['id']['value'])
        if len(sample_list) != 0:
            rr = r.table('samples').get_all(*sample_list)
            sample_objs = list(rr.run(g.conn, time_format='raw'))
        if len(file_list) != 0:
            rr = r.table('datafiles').get_all(*file_list)
            file_objs = list(rr.run(g.conn, time_format='raw'))
        #stick the objects 
        for s in selection:
            #get_all_sample_ids
            for i in inputs:
                if i['attribute'] == 'sample':
                    i['properties']['obj'] = get_an_item(i['properties']['id']['value'], sample_objs)
                elif i['attribute'] == 'file':
                    file_list.append(i['properties']['id']['value'])
                    i['properties']['obj'] = get_an_item(i['properties']['id']['value'], file_objs)
            for o in outputs:
                if o['attribute'] == 'sample':
                    o['properties']['obj'] = get_an_item(o['properties']['id']['value'], sample_objs)
                elif o['attribute'] == 'file':
                    file_list.append(o['properties']['id']['value'])
                    o['properties']['obj'] = get_an_item(o['properties']['id']['value'], file_objs)
        return selection
        
        
        
    

def get_an_item(id, obj_list):
    for obj in obj_list:
        if obj['id'] == id:
            return obj


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


@app.route('/process/update/<path:processid>', methods=['PUT'])
@apikey
@crossdomain(origin='*')
def update_process(processid):
    rv = r.table('processes').get(processid).update(request.json).run(g.conn)
    if (rv['replaced'] == 1 or rv['unchanged'] == 1):
        return ''
    else:
        error.update_conflict("Unable to update process: " + processid)
