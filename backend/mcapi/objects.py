from mcapp import app
from decorators import crossdomain, apikey, jsonp
from flask import request, g
import rethinkdb as r
import dmutil
import args
import access
import doc
import json


@app.route('/objects', methods=['GET'])
@jsonp
def get_all_objects():
    rr = r.table('samples').order_by(r.desc('birthtime'))
    selection = list(rr.run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)

@app.route('/objects/project/<project_id>', methods=['GET'])
@jsonp
def get_all_objects_by_project(project_id):
    rr = r.table('samples').filter(lambda sample: sample['projects'].map(lambda element: element['id'].eq(project_id))\
    .reduce(lambda left, right:left+right)).order_by(r.desc('birthtime'))
    selection = list(rr.run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)


@app.route('/objects/user/<user>', methods=['GET'])
@jsonp
def get_objects_user(user):
    rr = r.table('samples').filter({'owner': user}).order_by(r.desc('birthtime'))
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
    sample['description'] = dmutil.get_optional('description', j)
    sample['notes'] = dmutil.get_optional('notes', j)
    sample['available'] = dmutil.get_optional('available', j)
    sample['properties'] = {}
    doc.add_properties(dmutil.get_optional('default_properties', j), sample)
    doc.add_properties(dmutil.get_optional('added_properties', j), sample)
    sample['birthtime'] = r.now()
    sample['created_by'] = user
    sample['owner'] = user
    sample['treatments'] = []
    sample['parent_id'] = dmutil.get_optional('parent_id', j)
    sample['projects'] = dmutil.get_optional('projects', j, [])
    sample['template'] = dmutil.get_required('template', j)
    for treatment in dmutil.get_optional('treatments', j, []):
        t = doc.add_template_properties(treatment, 'treatment')
        sample['treatments'].append(t)
    sample_id = dmutil.insert_entry_id('samples', sample)
    _create_treatments_denorm(sample['treatments'], sample_id)
    return json.dumps({'id': sample_id})


def _create_treatments_denorm(treatments, sample_id):
    for treatment in treatments:
        _add_treatment_entries(treatment, sample_id)


def _add_treatment_entries(treatment, sample_id):
    for key in treatment['properties']:
        prop = treatment['properties'][key]
        prop['sample_id'] = sample_id
        prop['attribute'] = key
        prop['property'] = treatment['attribute']
        dmutil.insert_entry('treatments', prop)
        
@app.route('/object/<object_id>/project/<project_id>',
           methods=['PUT'])
@apikey
@crossdomain(origin='*')
def add_project_to_object(object_id, project_id):
    project = r.table('projects').get(project_id).run(g.conn)
    updated_projects_list = r.table('samples').get(object_id)['projects'].append({'id': project["id"], 'name': project["name"]}).run(g.conn)
    r.table('samples').get(object_id).update({'projects': updated_projects_list }).run(g.conn)
    return args.json_as_format_arg({'id': project['name']})


@app.route('/object/<object_id>/project/<project_id>/remove',
           methods=['PUT'])
@apikey
@crossdomain(origin='*')
def remove_project_from_object(object_id, project_id):
    project = r.table('projects').get(project_id).run(g.conn)
    res = r.table('samples').get(object_id)['projects']\
                               .difference([{'id': project["id"], 'name': project["name"]}]).run(g.conn)
    r.table('samples').get(object_id).update({'projects': res}).run(g.conn)
    ugroup = r.table('samples').get(object_id)\
                                  .run(g.conn, time_format='raw')
    access.reset()
    return args.json_as_format_arg(ugroup)

@app.route('/samples/project/<project_id>', methods=['GET'])
@jsonp
def samples_by_project(project_id):
    rv = r.table('samples_denorm').filter({'project_id': project_id})
    selection = list(rv.run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)

