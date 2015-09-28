from mcapp import app
from decorators import apikey
from flask import request, g
import rethinkdb as r
import resp


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
