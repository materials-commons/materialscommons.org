from ..mcapp import app
from ..decorators import apikey, jsonp
from flask import g
import rethinkdb as r
#from .. import dmutil
from .. import args
from ..utils import error_response

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
