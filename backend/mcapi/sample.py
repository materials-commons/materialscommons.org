from mcapp import app
from decorators import crossdomain, apikey, jsonp
from flask import request, g
import error
import rethinkdb as r
import dmutil
import json
import args
import access

@app.route('/samples', methods=['GET'])
@jsonp
def get_all_samples():
    rr = r.table('samples').order_by(r.desc('birthtime'))
    selection = list(rr.run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)

@app.route('/samples/<sample_id>', methods=['GET'])
@jsonp
def get_sample(sample_id):
    return dmutil.get_single_from_table('samples', sample_id)


@app.route('/samples/new', methods=['POST'])
@apikey
@crossdomain(origin='*')
def create_sample():
    j = request.get_json()
    sample = dict()
    user = access.get_user()
    sample['name'] = dmutil.get_required('name', j)
    sample['composition'] = dmutil.get_required('composition', j)
    sample['notes'] = dmutil.get_required('notes', j)
    sample['available'] = dmutil.get_optional('available', j)
    sample['model'] = dmutil.get_required('model', j)
    sample['birthtime'] = r.now()
    sample['created_by'] = user
    sample['owner'] = user
    sample['treatments_order'] = dmutil.get_optional('treatments_order',j)
    sample['treatments'] = dmutil.get_optional('treatments', j)
    return dmutil.insert_entry('samples', sample)
