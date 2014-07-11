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


class SItem:
    def __init__(self, id, name, path, owner, parent_id):
        self.id = id
        self.c_id = ""
        self.level = 0
        self.parent_id = parent_id
        self.name = name
        self.owner = owner
        self.path = path
        self.children = []
        

@app.route('/samples/<sample_id>/tree', methods=['GET'])
@jsonp
def sample_tree(sample_id):
    samples = list(r.table('samples').get_all().run(g.conn))
    all_samples = {}
    top_level_samples = []
    for samp in samples:
        sitem = SItem(sample['id'],sample['name'],sample['path'],sample['owner'],sample['parent_id'])    
        
    
    for ddir in datadirs:
        ditem = DItem2(ddir['id'], ddir['name'], 'datadir', ddir['owner'],
                       ddir['birthtime'], 0)
        ditem.level = ditem.name.count('/')
        ditem.c_id = next_id
        next_id = next_id + 1
        #
        # The item may have been added as a parent
        # before it was actually seen. We check for
        # this case and grab the children to add to
        # us now that we have the details for the ditem.
        if ditem.name in all_data_dirs:
            existing_ditem = all_data_dirs[ditem.name]
            ditem.children = existing_ditem.children
        all_data_dirs[ditem.name] = ditem
        if ditem.level == 0:
            top_level_dirs.append(ditem)
        for df in ddir['datafiles']:
            if df['name'][0] == ".":
                continue
            dfitem = DItem2(df['id'], df['name'], 'datafile',
                            df['owner'], df['birthtime'], df['size'])
            dfitem.fullname = ddir['name'] + "/" + df['name']
            dfitem.c_id = next_id
            next_id = next_id + 1
            ditem.children.append(dfitem)
        parent_name = dirname(ditem.name)
        if parent_name in all_data_dirs:
            parent = all_data_dirs[parent_name]
            parent.children.append(ditem)
        else:
            # We haven't seen the parent yet, but we need
            # to add the children. So, create a parent with
            # name and add children. When we finally see it
            # we will grab the children and add them to the
            # real object.
            parent = DItem2('', parent_name, 'datadir', '', '', 0)
            parent.children.append(ditem)
            all_data_dirs[parent_name] = parent
    return json.dumps(top_level_dirs, cls=DEncoder2)


    
    
    
    


