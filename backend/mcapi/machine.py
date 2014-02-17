from mcapp import app
from decorators import crossdomain, apikey, jsonp
from flask import request, g
import error
import rethinkdb as r
import dmutil
import json
import args


@app.route('/machines', methods=['GET'])
@jsonp
def get_all_machines():
    rr = r.table('machines').order_by(r.desc('birthtime'))
    selection = list(rr.run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)

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
    machine['model'] = dmutil.get_required('model', j)
    machine['birthtime'] = r.now()
    return dmutil.insert_entry('machines', machine)


@app.route('/materials', methods=['GET'])
@apikey(shared=True)
@jsonp
def get_all_materials():
    rr = r.table('materials').order_by(r.desc('birthtime'))
    selection = list(rr.run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)


@app.route('/materials/new', methods=['POST'])
@apikey
@crossdomain(origin='*')
def create_material():
    j = request.get_json()
    material = dict()
    material['name'] = dmutil.get_required('name', j)
    material['birthtime'] = r.now()
    material['notes'] = dmutil.get_optional('notes', j, [])
    material['contact_email'] = dmutil.get_optional('contact_email', j)
    material['alloy_name'] = dmutil.get_optional('alloy_name', j)
    material['composition'] = dmutil.get_optional('composition', j)
    material['model'] =  dmutil.get_optional('model', j)
    return dmutil.insert_entry('materials', material)


@app.route('/materials/<material_id>', methods=['GET'])
@jsonp
def get_material(material_id):
    return dmutil.get_single_from_table('materials', material_id)
