from ..mcapp import app
from ..decorators import crossdomain, apikey, jsonp
from flask import g, request
import rethinkdb as r
from .. import args
from datadirs import DItem, DEncoder
from os.path import dirname
import json
from .. import access
from ..import dmutil
from ..import validate
from loader.model import project
from loader.model import datadir


@app.route('/projects', methods=['GET'])
@apikey(shared=True)
@jsonp
def get_all_projects():
    user = access.get_user()
    rr = r.table('projects').filter({'owner': user})
    rr = args.add_all_arg_options(rr)
    items = list(rr.run(g.conn, time_format='raw'))
    return args.json_as_format_arg(items)


@app.route('/projects/<id>', methods=['GET'])
@apikey(shared=True)
@jsonp
def get_project(id):
    user = access.get_user()
    rr = r.table('projects').filter({'id': id})
    rr = args.add_all_arg_options(rr)
    items = list(rr.run(g.conn, time_format='raw'))
    return args.json_as_format_arg(items)


@app.route('/projects/<project_id>/datafiles')
@apikey
@jsonp
def get_all_datafiles_for_project(project_id):
    pass


@app.route('/projects/<project_id>/datadirs')
@apikey(shared=True)
@jsonp
def get_datadirs_for_project(project_id):
    user = access.get_user()
    rr = r.table('project2datadir').filter({'project_id': project_id})
    rr = rr.eq_join('project_id', r.table('projects')).zip()
    rr = rr.eq_join('datadir_id', r.table('datadirs')).zip()
    selection = list(rr.run(g.conn, time_format='raw'))
    if len(selection) > 0 and selection[0]['owner'] == user:
        return args.json_as_format_arg(selection)
    return args.json_as_format_arg([])


@app.route('/projects/<project_id>/datadirs/tree')
@apikey(shared=True)
@jsonp
def get_datadirs_as_tree_for_project(project_id):
    print 'tree***********88'
    user = access.get_user()
    rr = r.table('project2datadir').filter({'project_id': project_id})
    rr = rr.eq_join('project_id', r.table('projects')).zip()
    rr = rr.eq_join('datadir_id', r.table('datadirs')).zip()
    rr = rr.pluck('id', 'name', 'owner').order_by('name')
    selection = list(rr.run(g.conn, time_format='raw'))
    if len(selection) > 0 and selection[0]['owner'] != user:
        return args.json_as_format_arg([])
    all_data_dirs = {}
    top_level_dirs = []
    ddir = selection[0]
    current_datadir = add_to_top_level(ddir, top_level_dirs)
    all_data_dirs[current_datadir.name] = current_datadir
    for ddir in selection:
        if ddir['name'] <> current_datadir.name:
            if ddir['name'] not in all_data_dirs:
                if is_top_level(ddir):
                    dd = add_to_top_level(ddir, top_level_dirs)
                    all_data_dirs[dd.name] = dd
                elif ddir['name'] in all_data_dirs:
                    dd = all_data_dirs[ddir['name']]
                else:
                    dd = DItem(ddir['id'], ddir['name'], "datadir")
                    all_data_dirs[dd.name] = dd
                    dir_to_add_to = all_data_dirs[dirname(dd.name)]
                    dir_to_add_to.children.append(dd)
                current_datadir = dd
            else:
                current_datadir = all_data_dirs[ddir['name']]
    return json.dumps(top_level_dirs, indent=4, cls=DEncoder)


def is_top_level(ddir):
    return "/" not in ddir['name']


def add_to_top_level(ddir, top_level_dirs):
    item = find_in_ditem_list(ddir['name'], top_level_dirs)
    if not item:
        dd = DItem(ddir['id'], ddir['name'], "datadir")
        top_level_dirs.append(dd)
        item = dd
    return item


def find_in_ditem_list(name, items):
    for item in items:
        if item.name == name:
            return item
    return None


@app.route('/projects', methods=['POST'])
@apikey
@crossdomain(origin='*')
def create_project():
    j = request.get_json()
    user = access.get_user()
    name = dmutil.get_required('name', j)
    if validate.project_name_exists(name, user):
        return get_project_toplevel_datadir(name, user)
    datadir_id = make_toplevel_datadir(j, user)
    proj = project.Project(name, datadir_id, user)
    project_id = dmutil.insert_entry_id('projects', proj.__dict__)
    proj2datadir = {'project_id': project_id, 'datadir_id': proj.datadir}
    dmutil.insert_entry('project2datadir', proj2datadir)
    return args.json_as_format_arg(proj2datadir)


def get_project_toplevel_datadir(project, user):
    print "get_project_toplevel_datadir"
    filter_by = {'name': project, 'owner': user}
    selection = list(r.table('projects').filter(filter_by).run(g.conn))
    proj = selection[0]
    rv = {'project_id': proj['id'], 'datadir_id': proj['datadir']}
    return args.json_as_format_arg(rv)


def make_toplevel_datadir(j, user):
    name = dmutil.get_required('name', j)
    access = dmutil.get_optional('access', j, "private")
    ddir = datadir.DataDir(name, access, user, "")
    return dmutil.insert_entry_id('datadirs', ddir.__dict__)
