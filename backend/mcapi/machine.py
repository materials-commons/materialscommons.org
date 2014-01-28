from mcapp import app
from decorators import crossdomain, apikey, jsonp
from flask import request
import error
import rethinkdb as r
import dmutil
import json

@app.route('/machines', methods=['GET'])
@jsonp
def get_all_machines():
    return dmutil.get_all_from_table('machines')

@app.route('/machines/<machine_id>', methods=['GET'])
@jsonp
def get_machine(machine_id):
    return dmutil.get_single_from_table('machines', machine_id)

@app.route('/machines/new', methods=['POST'])
@apikey
@crossdomain(origin='*')
def create_machine():
    j = request.get_json()
    machine = dict()
    machine['name'] = dmutil.get_required('name', j)
    #machine['longname'] = dmutil.get_required('longname', j)
    machine['birthtime'] = r.now()
    machine['notes'] = dmutil.get_optional('notes', j, [])
    #contact_id = dmutil.get_required('contact', j)
    #if not dmutil.entry_exists('contacts', contact_id):
        #return error.bad_request("You must specify the contacts")
    #machine['contact'] = contact_id
    return dmutil.insert_entry('machines', machine)


@app.route('/add_two_numbers', methods=['GET'])
def add_numbers():
    x = request.args.get('a', 0, type=int)
    y = request.args.get('b', 0, type=int)
    return jsonify(result=x+y)

