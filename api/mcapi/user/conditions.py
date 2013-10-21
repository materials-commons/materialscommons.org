from ..mcapp import app
from ..decorators import crossdomain, apikey, jsonp
from flask import request
import rethinkdb as r
from ..utils import error_response
from .. import dmutil

@app.route('/v1.0/user/<user>/conditions/from_template', methods=['POST'])
@apikey
@crossdomain(origin='*')
def create_new_condition(user):
    j = request.get_json()
    c = dict()
    m = j['model']
    type_of_condition = dmutil.get_required('condition_type', j)
    process_id = dmutil.get_required('process', j)
    c['process'] = process
    c['project'] = dmutil.get_required('project', j)
    c['template'] = dmutil.get_required('id', j)
    for attr in m:
        c[attr['name']] = attr['value']
    c_id = dmutil.insert_entry_id('conditions', c)
    new_conditions = r.table('processes').get(process_id)[type_of_condition].append(c_id).run(g.conn)
    r.table('processes').update({type_of_condition:new_conditions}).run(g.conn)
    return json_as_format_arg({'id': c_id})
