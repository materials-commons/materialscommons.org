from ..mcapp import app
from ..decorators import apikey, jsonp
from flask import g
import rethinkdb as r
#from .. import dmutil
from .. import args
from ..utils import error_response
from datadirs import DItem, DEncoder
from os.path import dirname
import json

@app.route('/v1.0/user/<user>/projects', methods=['GET'])
@apikey
@jsonp
def get_all_projects(user):
    rr = r.table('projects').filter({'owner': user})
    rr = args.add_all_arg_options(rr)
    items = list(rr.run(g.conn, time_format='raw'))
    return args.json_as_format_arg(items)

@app.route('/v1.0/user/<user>/projects/<project_id>/datafiles')
@apikey
@jsonp
def get_all_datafiles_for_project(user, project_id):
    project = r.table('projects').get(project_id).run(g.conn)
    if project is None:
        return error_response(400)
    if project['owner'] != user:
        return error_response(400)
    return ""

@app.route('/v1.0/user/<user>/projects/<project_id>/datadirs')
@apikey
@jsonp
def get_datadirs_for_project(user, project_id):
    rr = r.table('project2datadir').filter({'project_id': project_id})
    rr = rr.eq_join('project_id', r.table('projects')).zip()
    rr = rr.eq_join('datadir_id', r.table('datadirs')).zip()
    selection = list(rr.run(g.conn, time_format='raw'))
    if len(selection) > 0 and selection[0]['owner'] == user:
        return args.json_as_format_arg(selection)
    return args.json_as_format_arg([])

@app.route('/v1.0/user/<user>/projects/<project_id>/datadirs/tree')
#@apikey
@jsonp
def get_datadirs_as_tree_for_project(user, project_id):
    rr = r.table('project2datadir').filter({'project_id': project_id})
    rr = rr.eq_join('project_id', r.table('projects')).zip()
    rr = rr.eq_join('datadir_id', r.table('datadirs')).zip()
    rr = rr.pluck('id', 'name').order_by('name')
    selection = list(rr.run(g.conn, time_format='raw'))
    all_data_dirs = {}
    for item in selection:
        name = item['name']
        if name not in all_data_dirs:
            all_data_dirs[name] = DItem(item['id'], name, "datadir")
        dname = dirname(name)
        if dname in all_data_dirs:
            dir_to_add_to = all_data_dirs[dname]
            dir_to_add_to.children.append(item)
    return json.dumps(all_data_dirs, indent=4, cls=DEncoder)
