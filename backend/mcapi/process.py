from mcapp import app
from decorators import crossdomain, apikey, jsonp
from flask import request, g
import rethinkdb as r
import error
import dmutil
import access
import args


@app.route('/processes/project/<project_id>', methods=['GET'])
@apikey
def get_processes_for_project(project_id):
    processes = get_processes(project_id)
    return dmutil.jsoner(processes)


def get_processes(project_id):
    processes = list(r.table("processes")
                     .get_all(project_id, index="project_id")
                     .run(g.conn, time_format="raw"))
    # For fast lookup put processes in a map
    by_ids = {p['id']: p for p in processes}

    # Add additional fields to fill in for the properties
    # and upstream/downstream processes
    for id, process in by_ids.iteritems():
        process['inputs'] = {}
        process['outputs'] = {}
        process['upstream'] = {}
        process['downstream'] = {}

    if len(by_ids) != 0:
        all_property_sets = get_property_sets(by_ids)
        add_process_properties(all_property_sets, by_ids)
        connect_feeders(all_property_sets, by_ids)
    return processes


def get_property_sets(processes):
    # Get all properties for all of the processes
    all = list(r.table("property_sets")
               .get_all(*processes.keys(), index="item_id")
               .eq_join("id", r.table("properties"), index="item_id")
               .map(lambda row: row.merge({
                   "left": {
                       "ps_id": row["left"]["id"],
                       "ps_name": row["left"]["name"],
                       "ps_process_id": row["left"]["item_id"],
                       "ps_item_type": row["left"]["item_type"]
                   }
               }))
               .without({
                   "left": {
                       "id": True,
                       "name": True,
                       "item_id": True,
                       "item_type": True
                   }
               })
               .zip().run(g.conn, time_format="raw"))
    return all


def add_process_properties(property_sets, processes):
    # Now go through each property set and add the property set
    # and its properties to the relevant process
    for property_set in property_sets:
        process_id = property_set["ps_process_id"]
        process = processes[process_id]
        add_property_set(property_set, process)


def add_property_set(property_set, process):
    ps_name = property_set["ps_name"]
    stype = property_set["stype"]
    if ps_name not in process[stype]:
        process[stype][ps_name] = []
    process[stype][ps_name].append({
        "unit": property_set["unit"],
        "other": property_set["other"],
        "display_name": property_set["display_name"],
        "name": property_set["name"],
        "ptype": property_set["ptype"],
        "value": property_set["value"]
    })


def connect_feeders(property_sets, processes):
    # Get the ids of all input/output properties that
    # could go into or come from another process
    inputs2processes, outputs2processes = get_feeders(property_sets)
    attach_feeders(inputs2processes, outputs2processes, processes)


def get_feeders(property_sets):
    feeder_ids = [prop['value'] for prop in property_sets
                  if prop["ptype"] == "file" or prop["ptype"] == "sample"]
    query = r.table("properties")\
             .get_all(*feeder_ids, index="value")\
             .eq_join("item_id", r.table("property_sets"))\
             .zip()\
             .eq_join("item_id", r.table("processes"))\
             .zip()
    i2p = {}
    o2p = {}
    for p in query.run(g.conn):
        if p["stype"] == "inputs":
            use = i2p
        else:
            use = o2p
        id = p["value"]
        if p["value"] not in use:
            use[id] = {
                "ptype": p["ptype"],
                "name": p["other"]["name"],
                "processes": {}
            }
        pid = p["id"]
        use[id]["processes"][pid] = p["name"]
    return i2p, o2p


def attach_feeders(inputs2processes, outputs2processes, processes):
    attach_feeders_for_type(outputs2processes, "downstream", "inputs",
                            processes)
    attach_feeders_for_type(inputs2processes, "upstream", "outputs",
                            processes)


# TODO: This shold probably be decomposed further. There is a lot
# of if and loop nesting.
def attach_feeders_for_type(io2process, feeder_name, io_name, processes):
    for key, process in processes.iteritems():
        for key, io_item in process[io_name].iteritems():
            # Only files and samples can go into a process
            # so skip other properties
            if key != "files" and key != "sample":
                continue
            # We now have an input or output set of item. Go through
            # each. The reason for the loop is we may have multiple
            # files in a single item (but only one sample, but we can
            # treat each as if there are multiple)
            for item in io_item:
                item_id = item["value"]
                # Check if this item is a potential feeder
                if item_id in io2process:
                    # It is a a feeder, now check the processes it goes
                    # to/from. We ignore our process.
                    for process_id in io2process[item_id]["processes"]:
                        if process_id != process["id"]:
                            # Not our process so add it. Check to see if
                            # our process entry exists or not and create
                            # if it doesn't
                            p_item = io2process[item_id]
                            if process_id not in process[feeder_name]:
                                process[feeder_name][process_id] = {
                                    "name": p_item["processes"][process_id],
                                    "items": []
                                }
                            process[feeder_name][process_id]["items"].append({
                                "item_name": p_item["name"],
                                "item_type": p_item["ptype"],
                            })


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
    rr = r.table('samples_processes_denorm').get_all(sample_id,
                                                     index='sample_id')
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
                item = i["properties"]["id"]["value"]
                if i['attribute'] == 'sample':
                    i['properties']['obj'] = get_an_item(item, sample_objs)
                elif i['attribute'] == 'file':
                    file_list.append(item)
                    i['properties']['obj'] = get_an_item(item, file_objs)
            for o in outputs:
                item = o["properties"]["id"]["value"]
                if o['attribute'] == 'sample':
                    o['properties']['obj'] = get_an_item(item, sample_objs)
                elif o['attribute'] == 'file':
                    file_list.append(item)
                    o['properties']['obj'] = get_an_item(item, file_objs)
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
                item = i["properties"]["id"]["value"]
                if i['attribute'] == 'sample':
                    i['properties']['obj'] = get_an_item(item, sample_objs)
                elif i['attribute'] == 'file':
                    file_list.append(i['properties']['id']['value'])
                    i['properties']['obj'] = get_an_item(item, file_objs)
            for o in outputs:
                item = o["properties"]["id"]["value"]
                if o['attribute'] == 'sample':
                    o['properties']['obj'] = get_an_item(item, sample_objs)
                elif o['attribute'] == 'file':
                    file_list.append(item)
                    o['properties']['obj'] = get_an_item(item, file_objs)
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
    id = dmutil.insert_entry('processes', p)
    return dmutil.jsoner_id(id)


@app.route('/process/update/<path:processid>', methods=['PUT'])
@apikey
@crossdomain(origin='*')
def update_process(processid):
    rv = r.table('processes').get(processid).update(request.json).run(g.conn)
    if (rv['replaced'] == 1 or rv['unchanged'] == 1):
        return ''
    else:
        error.update_conflict("Unable to update process: " + processid)
