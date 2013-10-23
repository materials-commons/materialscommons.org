from ..mcapp import app
from ..decorators import crossdomain, apikey
from flask import request, g
import rethinkdb as r
from .. import dmutil
from ..args import json_as_format_arg

@app.route('/v1.0/user/<user>/conditions/from_template', methods=['POST'])
@apikey
@crossdomain(origin='*')
def create_new_condition_from_template(user):
    j = request.get_json()
    c_id = create_condition_from_template(user, j)
    return json_as_format_arg({'id': c_id})

def create_condition_from_template(user, j):
    c = dict()
    m = j['model']
    type_of_condition = dmutil.get_required('condition_type', j)
    process_id = dmutil.get_required('process', j)
    c['owner'] = user
    c['process'] = process_id
    c['project'] = dmutil.get_required('project', j)
    c['template'] = dmutil.get_required('id', j)
    c['name'] = dmutil.get_required('name', j)
    for attr in m:
        c[attr['name']] = attr['value']
    c_id = dmutil.insert_entry_id('conditions', c)
    new_conditions = r.table('processes').get(process_id)[type_of_condition].append(c_id).run(g.conn)
    r.table('processes').update({type_of_condition:new_conditions}).run(g.conn)
    return c_id

@app.route('/v1.0/user/<user>/conditions/from_template_list', methods=['POST'])
@apikey
@crossdomain(origin='*')
def create_new_conditions_from_template_list(user):
    j = request.get_json()
    ids = []
    for condition in j['input_conditions']:
        condition['condition_type'] = 'input_conditions'
        c_id = create_condition_from_template(user, condition)
        ids.append(c_id)
    for condition in j['output_conditions']:
        condition['condition_type'] = 'output_conditions'
        c_id = create_condition_from_template(user, condition)
        ids.append(c_id)
    return json_as_format_arg({'ids': ids})
