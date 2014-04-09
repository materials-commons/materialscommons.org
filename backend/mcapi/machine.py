from mcapp import app
from decorators import crossdomain, apikey, jsonp
from flask import request, g
import rethinkdb as r
import dmutil
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
