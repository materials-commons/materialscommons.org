from mcapp import app
from decorators import apikey, jsonp
from flask import request, g
import rethinkdb as r
import resp


@app.route('/processes/project/<project_id>', methods=['GET'])
@apikey
@jsonp
def get_processes_for_project(project_id):
    processes = get_process_information(project_id)
    return resp.to_json(processes)


def get_process_information(project_id):
    processes = list(r.table('project2process')
                     .get_all(project_id, index="project_id")
                     .eq_join("process_id", r.table("processes")).zip()
                     .order_by(r.desc('birthtime'))
                     .run(g.conn, time_format="raw"))
    return processes


@app.route('/processes/<process_id>', methods=['PUT'])
@apikey
def update_process(process_id):
    j = request.get_json()
    # Update Name, What, Why
    r.table('processes').get(process_id).update({'name': j['name'],
        'what': j['what'], 'why': j['why']})\
        .run(g.conn, time_format="raw")
    # Update setup
    if 'setup' in j:
        for prop in j['setup']:
            update_property('setupproperties', prop)
    if 'samples' in j:
        for sample in j['samples']:
            if 'properties' in sample:
                for prop in sample['properties']:
                    for measure in prop['measurements']:
                        update_property('measurements', measure)
    return resp.to_json_id(process_id)


def update_property(table_name, prop):
    rv = r.table(table_name).get(prop['id'])\
        .update({'value': prop['value'], 'unit': prop['unit']})\
        .run(g.conn, time_format="raw")
    return rv
