from mcapp import app
from decorators import crossdomain, apikey, jsonp
from flask import request, g
import rethinkdb as r
import dmutil
import doc
import access
import resp


@app.route('/machines', methods=['GET'])
@jsonp
def get_all_machines():
    rr = r.table('machines').order_by('name')
    machines = list(rr.run(g.conn, time_format='raw'))
    return resp.to_json(machines)


@app.route('/machines/<machine_id>', methods=['GET'])
@jsonp
def get_machine(machine_id):
    return dmutil.get_single_from_table('machines', machine_id)


@app.route('/machines/new', methods=['POST'])
@apikey
@crossdomain(origin='*')
def create_machine():
    j = request.get_json()
    user = access.get_user()
    machine = dict()
    machine['name'] = dmutil.get_required('name', j)
    machine['notes'] = dmutil.get_optional('notes', j)
    machine['description'] = dmutil.get_optional("description", j)
    machine['birthtime'] = r.now()
    machine['properties'] = {}
    machine['created_by'] = user
    doc.add_properties(dmutil.get_optional('default_properties', j), machine)
    doc.add_properties(dmutil.get_optional('added_properties', j), machine)
    id = dmutil.insert_entry('machines', machine)
    return resp.to_json_id(id)
