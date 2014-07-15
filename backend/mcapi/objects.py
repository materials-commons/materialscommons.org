from mcapp import app
from decorators import crossdomain, apikey, jsonp
from flask import request, g
import rethinkdb as r
import dmutil
import args
import access
import doc
import json
from os.path import dirname


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
    sample['template'] = dmutil.get_required('template', j)
    sample['path'] = dmutil.get_required('path', j)
    for treatment in dmutil.get_optional('treatments', j, []):
        t = doc.add_template_properties(treatment, 'treatment')
        sample['treatments'].append(t)
    sample_id = dmutil.insert_entry_id('samples', sample)
    _create_treatments_denorm(sample['treatments'], sample_id)
    _join_sample_projects(dmutil.get_optional('projects', j, []), sample_id)
    return json.dumps({'id': sample_id})

def _join_sample_projects(projects, sample_id):
    for p in projects:
        rr = r.table('projects_samples').insert({'sample_id': sample_id, 'project_id': p['id'], 'project_name': p['name']}).run(g.conn) 

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


class SItem:
    def __init__(self, id, name, path, owner):
        self.id = id
        self.level = 0
        self.name = name
        self.owner = owner
        self.path = path
        self.children = []
        

class DEncoder2(json.JSONEncoder):
    def default(self, o):
        return o.__dict__


@app.route('/samples/<project_id>/tree', methods=['GET'])
@jsonp
def sample_tree(project_id):
    samples = r.table('projects_samples').get_all(project_id, index='project_id').eq_join('sample_id', r.table('samples')).zip().run(g.conn)
    all_samples = {}
    top_level_samples = []
    for samp in samples:
        sitem = SItem(samp['id'],samp['name'],samp['path'],samp['owner'])
        sitem.level = sitem.path.count('/')
        if sitem.path in all_samples:
            existing_sitem = all_samples[sitem.path]
            sitem.children = existing_sitem.children
        all_samples[sitem.path] = sitem
        if sitem.level == 0:
            top_level_samples.append(sitem)
        parent_name = dirname(sitem.path)
        if parent_name in all_samples:
            parent = all_samples[parent_name]
            parent.children.append(sitem)
        else:
            parent = SItem('', parent_name, '', '')
            parent.children.append(sitem)
            all_samples[parent_name] = parent
    return json.dumps(top_level_samples, cls=DEncoder2)
    
    
    


