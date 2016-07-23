from ..mcapp import app
from ..decorators import crossdomain, apikey, jsonp
from flask import g, request
import rethinkdb as r
from .. import args
from .. import dmutil
from .. import validate
from .. import error
from loader.model import access as am
from loader.model import datadir, project
from .. import process, access
from .. import cache


@app.route('/projects', methods=['GET'])
@apikey(shared=True)
@jsonp
def get_all_group_projects():
    user = access.get_user()
    if access.is_administrator(user):
        projects = list(r.table('projects').order_by('name')
                        .filter(r.row["owner"].ne("delete@materialscommons.org"))
                        .run(g.conn, time_format='raw'))
    else:
        projects = list(r.table('access').get_all(user, index='user_id')
                        .eq_join('project_id', r.table('projects')).zip()
                        .order_by('name')
                        .run(g.conn, time_format='raw'))
    add_computed_attributes(projects, user)
    return args.json_as_format_arg(projects)


def add_computed_attributes(projects, user):
    for p in projects:
        p['reviews'] = []
        p['samples'] = []
        p['drafts'] = []
        p['processes'] = []
        p['users'] = []
        p['notes'] = []
        p['events'] = []
        p['experiments'] = []
        p['datasets'] = []
        p['file_count'] = 0
        if 'process_templates' not in p:
            p['process_templates'] = []
    project_ids = [p['id'] for p in projects]
    projects_by_id = {p['id']: p for p in projects}

    if len(projects) > 0:
        add_users(projects_by_id, project_ids)
        add_reviews(projects_by_id, project_ids)
        add_samples(projects_by_id, project_ids)
        add_processes(projects_by_id, project_ids)
        add_notes(projects_by_id, project_ids)
        add_events(projects_by_id, project_ids)
        add_file_counts(projects_by_id, project_ids)
        add_experiments(projects_by_id, project_ids)
        add_datasets(projects_by_id, project_ids)


def add_users(projects_by_id, project_ids):
    users = list(r.table('access')
                 .get_all(*project_ids, index='project_id')
                 .run(g.conn, time_format='raw'))
    add_computed_items(projects_by_id, users, 'project_id', 'users')


def add_experiments(projects_by_id, project_ids):
    experiments = list(r.table('project2experiment').get_all(*project_ids, index='project_id')
                       .eq_join('experiment_id', r.table('experiments')).zip().run(g.conn, time_format='raw'))
    add_computed_items(projects_by_id, experiments, 'project_id', 'experiments')


def add_reviews(projects_by_id, project_ids):
    reviews = list(r.table('reviews')
                   .get_all(*project_ids, index='project')
                   .order_by('mtime')
                   .run(g.conn, time_format='raw'))
    add_computed_items(projects_by_id, reviews, 'project', 'reviews')


def add_samples(projects_by_id, project_ids):
    samples = list(r.table('project2sample')
                   .get_all(*project_ids, index='project_id')
                   .eq_join('sample_id', r.table('sample2propertyset'),
                            index='sample_id')
                   .zip().filter({'current': True})
                   .eq_join('sample_id', r.table('samples'))
                   .zip()
                   .order_by('name')
                    .merge(lambda sample: {
                        'properties': r.table('propertyset2property')
                        .get_all(sample['property_set_id'], index= 'property_set_id')
                        .eq_join('property_id', r.table('properties')).zip()
                        .order_by('name')
                        .merge(lambda property: {
                            'best_measure': r.table('best_measure_history')\
                            .get_all(property['best_measure_id'])
                                            .eq_join('measurement_id',
                            r.table('measurements')).zip().coerce_to('array')
                        }),

                    'linked_files': r.table('sample2datafile')
                    .get_all(sample['id'],
                    index='sample_id').eq_join('datafile_id',
                    r.table('datafiles')).zip().coerce_to('array'),

                    'property_sets': r.table('sample2propertyset').get_all(sample['id'], index='sample_id').coerce_to('array'),
                    'processes': r.table('process2sample').get_all(sample['id'], index='sample_id').coerce_to('array')
                }).coerce_to('array').run(g.conn, time_format='raw'))
    # for sample in samples:
    #     sample['properties'] = {}
    add_computed_items(projects_by_id, samples, 'project_id', 'samples')


def add_drafts(projects_by_id, project_ids, user):
    drafts = list(r.table('drafts')
                  .get_all(*project_ids, index='project_id')
                  .filter({'owner': user})
                  .run(g.conn, time_format='raw'))
    add_computed_items(projects_by_id, drafts, 'project_id', 'drafts')


def add_processes(projects_by_id, project_ids):
    processes = []
    for project_id in project_ids:
        processes.extend(process.get_process_information(project_id))
    add_computed_items(projects_by_id, processes, 'project_id', 'processes')


def add_notes(projects_by_id, project_ids):
    notes = list(r.table('notes').get_all(*project_ids, index='project_id')
                 .order_by('mtime')
                 .run(g.conn, time_format='raw'))
    add_computed_items(projects_by_id, notes, 'project_id', 'notes')


def add_datasets(projects_by_id, project_ids):
    datasets = list(r.table('project2experiment').get_all(*project_ids, index='project_id')
                    .eq_join('experiment_id', r.table('experiment2dataset'), index='experiment_id')
                    .zip().pluck('project_id', 'dataset_id')
                    .eq_join('dataset_id', r.table('datasets')).zip().run(g.conn, time_format='raw'))
    add_computed_items(projects_by_id, datasets, 'project_id', 'datasets')


def add_events(projects_by_id, project_ids):
    events = list(r.table('events').get_all(*project_ids, index='project_id')
                  .order_by('mtime')
                  .run(g.conn, time_format='raw'))
    add_computed_items(projects_by_id, events, 'project_id', 'events')


def add_file_counts(projects_by_id, project_ids):
    project_file_counts = r.table('project2datafile').get_all(*project_ids, index='project_id')\
                               .group('project_id').count().run(g.conn)
    for project_id in project_file_counts.keys():
        file_count = project_file_counts[project_id]
        if project_id in projects_by_id:
            projects_by_id[project_id]['file_count'] = file_count


def add_computed_items(projects_by_id, items, projects_key, item_key):
    for item in items:
        project_id = item[projects_key]
        if project_id in projects_by_id:
            projects_by_id[project_id][item_key].append(item)


@app.route('/projects/<project_id>/tree2')
@apikey(shared=True)
@jsonp
def get_project_tree2(project_id):
    user = access.get_user()
    proj = r.table('projects').get(project_id).run(g.conn)
    if proj is None:
        return error.bad_request("Unknown project id: %s" % (project_id))
    access.check(user, proj['owner'], project_id)
    reload = request.args.get('reload')
    if reload is None:
        return cache.get_project_tree(project_id)
    else:
        return cache.reload_project_tree(project_id)


@app.route('/projects', methods=['POST'])
@apikey
@crossdomain(origin='*')
def create_project():
    j = request.get_json()
    user = access.get_user()
    name = dmutil.get_required('name', j)
    description = dmutil.get_optional('description', j)
    if validate.project_name_exists(name, user):
        return get_project_toplevel_datadir(name, user)
    datadir_id = make_toplevel_datadir(j, user)
    proj = project.Project(name, datadir_id, user)
    proj.description = description
    project_id = dmutil.insert_entry_id('projects', proj.__dict__)
    r.table("datadirs").get(datadir_id).update({
        "project": project_id
    }).run(g.conn)
    proj2datadir = {'project_id': project_id, 'datadir_id': datadir_id}
    dmutil.insert_entry('project2datadir', proj2datadir)
    # add entry to access table
    access_entry = am.Access(user, project_id, name)
    dmutil.insert_entry('access', access_entry.__dict__)
    return args.json_as_format_arg(proj2datadir)


def get_project_toplevel_datadir(project, user):
    if access.is_administrator(user):
        filter_by = {'name': project}
    else:
        filter_by = {'name': project, 'owner': user}
    selection = list(r.table('projects').filter(filter_by).run(g.conn))
    proj = selection[0]
    dirs = list(r.table('projects').get_all(proj['id'])
                .eq_join('name', r.table('datadirs'), index='name').zip().run(g.conn))

    rv = {'project_id': proj['id'], 'datadir_id': dirs[0]['id']}
    return args.json_as_format_arg(rv)


def make_toplevel_datadir(j, user):
    name = dmutil.get_required('name', j)
    ddir = datadir.DataDir(name, user, "", "")
    dir_id = dmutil.insert_entry_id('datadirs', ddir.__dict__)
    return dir_id


@app.route('/project/<id>/reviews')
@apikey(shared=True)
@jsonp
def get_reviews_for_project(id):
    user = access.get_user()
    project = r.table('projects').get(id).run(g.conn)
    if project is None:
        return error.not_found('No such project: %s' % (id))
    access.check(user, project['owner'], project['id'])
    reviews = list(r.table('reviews')
                   .get_all(id, index='project').order_by(r.desc('mtime'))
                   .run(g.conn, time_format='raw'))
    return args.json_as_format_arg(reviews)
