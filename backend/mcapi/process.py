from mcapp import app
from decorators import crossdomain, apikey, jsonp
from flask import request, g, jsonify, Response
import rethinkdb as r
import error
import dmutil
import access
import args
import json

def remove_duplicate_processes(process):
    ip_processes = process['input_processes']
    op_processes = process['output_processes']
    uniq_ip_processes = {}
    uniq_op_processes = {}
    for ip in ip_processes:
        other_names = []
        if ip['id'] in uniq_ip_processes:
            other_names = uniq_ip_processes[ip['id']]['related_files']
            other_names.append(ip['other_name'])
            uniq_ip_processes[ip['id']] = {'process_name': ip['name'], 'related_files': other_names}   
        else:
            other_names.append(ip['other_name'])
            uniq_ip_processes[ip['id']] = {'process_name': ip['name'], 'related_files': other_names }
    for op in op_processes:
        other_names = []
        if op['id'] in uniq_op_processes:
            other_names = uniq_op_processes[op['id']]['related_files']
            other_names.append(op['other_name'])
            uniq_op_processes[op['id']] = {'process_name': op['name'], 'related_files': other_names}   
        else:
            other_names.append(op['other_name'])
            uniq_op_processes[op['id']] = {'process_name': op['name'], 'related_files': other_names}
    process['input_processes'] = uniq_ip_processes
    process['output_processes'] = uniq_op_processes
    return process


def build_process_relations(process):
    process['input_processes'] = []
    process['output_processes'] = [] 
    values = list(r.table('property_sets').get_all(process['id'], index='item_id').eq_join('id', r.table('properties'), index='item_id').zip().filter((r.row["ptype"] == 'file') | (r.row["ptype"] =='sample')).pluck('value').run(g.conn))
    ids = []
    for each in values:
        ids.append(each['value'])
    processes = list(r.table('properties').get_all(*ids, index='value').eq_join('item_id', r.table('property_sets')).zip().pluck('item_id','stype', 'other').distinct().eq_join('item_id', r.table('processes')).zip().pluck('item_id', 'stype', 'name', 'other').run(g.conn))
    for p in processes:
        if p['item_id'] != process['id']:
            if p['stype'] == 'inputs':
                process['input_processes'].append({'id':p['item_id'], 'name':p['name'], 'other_name': p['other']['name']})
            else:
                process['output_processes'].append({'id':p['item_id'], 'name':p['name'], 'other_name': p['other']['name']})
    #Check for duplicate processes and return
    process = remove_duplicate_processes(process)
    return process


@app.route('/processes/project/<project_id>', methods=['GET'])
def get_processes_by_project(project_id):
    complete_processes = []
    rr = r.table('processes').get_all(project_id, index='project_id')
    selection = list(rr.run(g.conn, time_format='raw'))
    for process in selection:
        process['inputs'] = {}
        process['outputs'] = {}
        property_sets = r.table('property_sets').filter({'item_id': process['id'], 'item_type': 'process'}).run(g.conn)
        build_process_relations(process)
        for each_set in property_sets:
            rr = r.table('properties').filter({'item_id': each_set['id'], 'item_type': 'property_set'})
            properties = list(rr.run(g.conn, time_format='raw'))
            if each_set['stype'] == 'inputs':
                process['inputs'][each_set['name']] = properties
            else:
                process['outputs'][each_set['name']] = properties
        complete_processes.append(process)
    return Response(json.dumps(complete_processes), mimetype="application/json")



@app.route('/processes/<process_id>', methods=['GET'])
@apikey(shared=True)
@jsonp
def get_process(process_id):
    process = dmutil.get_single_from_table('processes', process_id, raw=True)
    if process is None:
        return error.bad_request("Unknown process")
    result = build_sample_file_objects(process, '')
    return args.json_as_format_arg(result)


@app.route('/processes/template/<template_id>', methods=['GET'])
@apikey
@jsonp
def get_all_processes_for_template(template_id):
    rr = r.table('processes').filter({'template': template_id})
    selection = list(rr.run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)


@app.route('/processes/sample/<sample_id>', methods=['GET'])
@apikey
@jsonp
def get_processes_by_sample(sample_id):
    rr = r.table('samples_processes_denorm').get_all(sample_id, index='sample_id')
    selection = list(rr.run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)


@app.route('/processes/file/<file_id>', methods=['GET'])
@jsonp
def get_processes_by_file(file_id):
    rv = r.table('datafiles_denorm')\
          .filter({'df_id': file_id})\
          .eq_join('process_id', r.table('processes')).zip()
    selection = list(rv.run(g.conn, time_format='raw'))
    result = build_sample_file_objects(selection, 'array')
    return args.json_as_format_arg(result)


def build_sample_file_objects(selection, type):
    sample_list = []
    file_list = []
    file_objs = []
    if type == "array":
        for s in selection:
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
        # stick the objects
        for s in selection:
            # get_all_sample_ids
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
        # stick the objects
        for s in selection:
            # get_all_sample_ids
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
