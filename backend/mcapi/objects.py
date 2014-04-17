from mcapp import app
from decorators import crossdomain, apikey, jsonp
from flask import request, g
import rethinkdb as r
import dmutil
import args
import access
import doc


@app.route('/objects', methods=['GET'])
@jsonp
def get_all_objects():
    rr = r.table('samples').order_by(r.desc('birthtime'))
    selection = list(rr.run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)


@app.route('/objects/<object_id>', methods=['GET'])
@jsonp
def get_object(object_id):
    return dmutil.get_single_from_table('samples', object_id)


@app.route('/objects/new', methods=['POST'])
@apikey
@crossdomain(origin='*')
def create_object():
    j = request.get_json()
    sample = dict()
    user = access.get_user()
    sample['name'] = dmutil.get_required('name', j)
    sample['composition'] = dmutil.get_required('composition', j)
    sample['notes'] = dmutil.get_required('notes', j)
    sample['available'] = dmutil.get_optional('available', j)
    sample['properties'] = {}
    doc.add_properties(dmutil.get_optional('default_properties', j), sample)
    doc.add_properties(dmutil.get_optional('added_properties', j), sample)
    sample['birthtime'] = r.now()
    sample['created_by'] = user
    sample['owner'] = user
    sample['treatments'] = []
    for treatment in dmutil.get_optional('treatments', j, []):
        t = doc.add_template_properties(treatment, 'treatment')
        sample['treatments'].append(t)
    return dmutil.insert_entry('samples', sample)
