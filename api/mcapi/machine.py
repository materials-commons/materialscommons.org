from mcapp import app
from decorators import crossdomain, apikey, jsonp
from flask import request
from utils import error_response
import rethinkdb as r
import dmutil

@app.route('/v1.0/machines', methods=['GET'])
@jsonp
def get_all_machines():
    return dmutil.get_all_from_table('machines')

@app.route('/v1.0/machines/<machine_id>', methods=['GET'])
@jsonp
def get_machine(machine_id):
    return dmutil.get_single_from_table('machines', machine_id)

@app.route('/v1.0/machines', methods=['POST'])
@apikey
@crossdomain(origin='*')
def create_machine():
    j = request.get_json()
    machine = dict()
    machine['name'] = dmutil.get_required('name', j)
    machine['longname'] = dmutil.get_required('longname', j)
    machine['birthtime'] = r.now()
    machine['notes'] = dmutil.get_optional('notes', j, [])
    contact_id = dmutil.get_required('contact', j)
    if not dmutil.entry_exists('contacts', contact_id):
        return error_response(400)
    machine['contact'] = contact_id
    return dmutil.insert_entry('machines', machine)
