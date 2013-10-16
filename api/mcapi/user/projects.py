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

@app.route('/v1.0/user/<user>/project/<project_id>/datafiles')
@apikey
@jsonp
def get_all_datafiles_for_project(user, project_id):
    project = r.table('projects').get(project_id).run(g.conn)
    if project is None:
        return error_response(400)
    if project['owner'] != user:
        return error_response(400)
    return ""
