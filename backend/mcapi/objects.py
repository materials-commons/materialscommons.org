from mcapp import app
from decorators import apikey, jsonp, eventlog
from flask import request, g, jsonify
import rethinkdb as r
import dmutil
import args
import access
import json
from os.path import dirname
import error
from loader.model import note
import resp


@app.route('/sample/measurements/<sample_id>/<property_set_id>')
@jsonp
def get_sample_measurements(sample_id, property_set_id):
    measurements = list(
        r.table('propertyset2property').get_all(property_set_id,
                                                index='attribute_set_id') \
        .eq_join('attribute_id', r.table('properties')).zip() \
        .merge(lambda property:
               {
                   'best_measure':
                       r.table('best_measure_history').get_all(
                           property['best_measure_id'])
               .eq_join('measurement_id', r.table('measurements')).zip()
               .coerce_to('array'),

                   'measurements':
                       r.table('property2measurement')
               .get_all(property['id'], index="attribute_id")
               .eq_join('measurement_id', r.table('measurements')).zip()
               .merge(lambda measurement:
                      {
                          'process':
                              r.table('process2measurement')
                      .get_all(measurement['id'], index="measurement_id")
                      .eq_join('process_id', r.table('processes')).zip()
                      .pluck('id', 'name')
                      .coerce_to('array')
                      })
               .coerce_to('array')
               }).run(g.conn, time_format="raw"))
    return resp.to_json(measurements)


@app.route('/sample/propertysets/<sample_id>', methods=['GET'])
@jsonp
def get_propertysets(sample_id):
    psets = r.table('sample2propertyset') \
        .get_all(sample_id, index='sample_id') \
        .eq_join('property_set_id', r.table('process2sample'),
                 index='property_set_id').zip() \
        .group('property_set_id').pluck('process_id') \
        .eq_join('process_id', r.table('processes')).zip() \
        .pluck('process_id', 'name', 'does_transform')\
            .run(g.conn, time_format="raw")
    return resp.to_json(psets)


@app.route('/best_measure', methods=['POST'])
@apikey
@eventlog
def create_best_measure_history():
    j = request.get_json()
    best_measure_history = dict()
    best_measure_history['attribute_id'] = dmutil.get_required('attribute_id',
                                                               j)
    best_measure_history['measurement_id'] = dmutil.get_required(
        'measurement_id', j)
    best_measure_history['_type'] = 'best_measure_history'
    best_measure_history['when'] = r.now()
    history = dmutil.insert_entry('best_measure_history', best_measure_history,
                                  return_created=True)
    if history:
        rv = r.table('properties').get(best_measure_history['attribute_id']) \
            .update({'best_measure_id': history['id']}).run(g.conn)
    return jsonify(history)


@app.route('/sample/property_set/<sample_id>', methods=['GET'])
@jsonp
def get_current_propertyset(sample_id):
    sample2property_set = list(r.table('sample2propertyset').get_all(sample_id,
                                                                     index='sample_id').filter(
        {'current': True}).run(g.conn, time_format="raw"))
    return args.json_as_format_arg(sample2property_set)


@app.route('/sample/datafile/<sample_id>', methods=['GET'])
@jsonp
def get_sample2files(sample_id):
    files = list(
        r.table('sample2datafile').get_all(sample_id, index='sample_id')
        .eq_join('datafile_id', r.table('datafiles')).zip()
        .pluck('name', 'owner', 'size', 'birthtime', 'mtime', 'id',
               'mediatype')
        .run(g.conn, time_format="raw"))
    return resp.to_json(files)


def getProcessesandProjects(object_id):
    processes = list(r.table('processes2samples')
                     .get_all(object_id, index='sample_id')
                     .run(g.conn))
    projects = list(r.table('projects2samples')
                    .filter({'sample_id': object_id})
                    .run(g.conn))
    return processes, projects


@app.route('/objects/<object_id>', methods=['GET'])
@jsonp
def get_object(object_id):
    o = dict()
    rr = r.table('samples').get(object_id)
    selection = rr.run(g.conn, time_format='raw')
    o["sample"] = selection
    o["processes"], o['projects'] = getProcessesandProjects(object_id)
    return args.json_as_format_arg(o)


@app.route('/objects', methods=['GET'])
@jsonp
def get_all_objects():
    rr = r.table('samples').order_by(r.desc('birthtime'))
    selection = list(rr.run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)


@app.route('/objects/project/<project_id>', methods=['GET'])
@jsonp
def get_all_objects_by_project(project_id):
    rr = r.table('samples') \
        .filter(lambda sample: sample['projects']
                .map(lambda element: element['id'].eq(project_id))
                .reduce(lambda left, right: left + right)) \
        .order_by(r.desc('birthtime'))
    selection = list(rr.run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)


@app.route('/objects/user/<user>', methods=['GET'])
@jsonp
def get_objects_user(user):
    rr = r.table('samples').filter({'owner': user}) \
        .order_by(r.desc('birthtime'))
    selection = list(rr.run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)


@app.route('/objects/update/<object_id>', methods=['PUT'])
@apikey
def updateobject(object_id):
    rv = r.table('samples').get(object_id).update(request.json).run(g.conn)
    if (rv['replaced'] == 1 or rv['unchanged'] == 1):
        return ''
    else:
        error.update_conflict("Unable to update object: " + object_id)


@app.route('/objects/new', methods=['POST'])
@apikey
@eventlog
def create_object():
    j = request.get_json()
    sample = dict()
    user = access.get_user()
    sample['name'] = dmutil.get_required('name', j)
    if '/' in sample['name']:
        error.not_acceptable("forward slash in sample name")
    else:
        sample['description'] = dmutil.get_optional('description', j)
        sample['available'] = dmutil.get_optional('available', j)
        sample['properties'] = dmutil.get_optional('properties', j)
        sample['alloy'] = dmutil.get_optional('alloy', j)
        sample['birthtime'] = r.now()
        sample['mtime'] = sample['birthtime']
        sample['created_by'] = user
        sample['owner'] = user
        sample['parent_id'] = dmutil.get_optional('parent_id', j)
        sample['path'] = dmutil.get_required('path', j)
        sample['project_id'] = dmutil.get_required('project_id', j)
        sample['_type'] = 'sample'
        notes = dmutil.get_optional('notes', j)
        title = dmutil.get_optional('title', j)
        s = dmutil.insert_entry('samples', sample, return_created=True)
        sid = s['id']
        _join_sample_projects(dmutil.get_optional('projects', j, []), sid)
        # Add note into notes table
        if title or notes:
            n = note.Note(user, notes, title, sid,
                          'sample', sample['project_id'])
            rv = dmutil.insert_entry('notes', n.__dict__, return_created=True)
            s['notes'] = rv
        return jsonify(s)


def _join_sample_projects(projects, sample_id):
    for p in projects:
        r.table('projects2samples').insert({
            'sample_id': sample_id,
            'project_id': p['id'],
            'project_name': p['name']
        }).run(g.conn)


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


@app.route('/sample/project/join', methods=['POST'])
@apikey
def join_project_sample():
    j = request.get_json()
    sample_project = dict()
    sample_project['sample_id'] = dmutil.get_required('sample_id', j)
    sample_project['project_id'] = dmutil.get_required('project_id', j)
    sample_project['project_name'] = dmutil.get_required('project_name', j)
    id = dmutil.insert_entry_id('projects2samples', sample_project)
    return id


@app.route('/samples/project/<sample_id>', methods=['GET'])
@apikey
@jsonp
def join_table_entries(sample_id):
    rv = r.table('projects2samples').filter({'sample_id': sample_id})
    selection = list(rv.run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)


@app.route('/samples/by_project/<project_id>', methods=['GET'])
@apikey
@jsonp
def get_samples_by_project(project_id):
    rv = r.table('projects2samples') \
        .get_all(project_id, index='project_id') \
        .eq_join('sample_id', r.table('samples')).zip()
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
@apikey
@jsonp
def sample_tree(project_id):
    samples = r.table('projects2samples') \
        .get_all(project_id, index='project_id') \
        .eq_join('sample_id', r.table('samples')) \
        .zip().run(g.conn)
    all_samples = {}
    top_level_samples = []
    for samp in samples:
        sitem = SItem(samp['id'], samp['name'], samp['path'], samp['owner'])
        sitem.level = sitem.path.count('/')
        sitem.numofchildren = 0
        if sitem.path in all_samples:
            existing_sitem = all_samples[sitem.path]
            sitem.children = existing_sitem.children
            sitem.numofchildren = len(sitem.children)
        all_samples[sitem.path] = sitem
        if sitem.level == 0:
            top_level_samples.append(sitem)
        parent_name = dirname(sitem.path)
        if parent_name in all_samples:
            parent = all_samples[parent_name]
            parent.children.append(sitem)
            parent.numofchildren = len(parent.children)
        else:
            parent = SItem('', parent_name, '', '')
            parent.children.append(sitem)
            parent.numofchildren = len(parent.children)
            all_samples[parent_name] = parent
    return json.dumps(top_level_samples, cls=DEncoder2)


@app.route('/objects/elements', methods=['GET'])
@apikey
@jsonp
def get_all_elements():
    rr = r.table('elements').order_by('name')
    selection = list(rr.run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)