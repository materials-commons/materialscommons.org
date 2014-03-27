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
    machine['additional'] = dmutil.get_required('additional', j)
    machine['name'] = dmutil.get_required('Name', j)
    machine['notes'] = dmutil.get_required('Notes', j)
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
    material['alloy'] = dmutil.get_required('alloy', j)
    material['notes'] = dmutil.get_required('notes', j)
    material['birthtime'] = r.now()
    material['treatments_order'] = dmutil.get_optional('treatments_order',j)
    material['treatments'] = dmutil.get_optional('treatments', j)
    return dmutil.insert_entry('materials', material)


@app.route('/materials/<material_id>', methods=['GET'])
@jsonp
def get_material(material_id):
    return dmutil.get_single_from_table('materials', material_id)
