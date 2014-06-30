from ..mcapp import app
from ..decorators import apikey, jsonp, crossdomain
import json
from flask import g, request
import rethinkdb as r
from ..utils import json_for_single_item_list
from ..args import add_all_arg_options, json_as_format_arg
from .. import access
from ..import dmutil
from ..import error
from ..import validate
from loader.model import datadir


@app.route('/datadir/<path:datadirid>')
@apikey(shared=True)
@jsonp
def datadir_for_user(datadirid):
    user = access.get_user()
    rr = r.table('datadirs').filter({'id': datadirid})
    rr = add_all_arg_options(rr)
    selection = list(rr.run(g.conn, time_format='raw'))
    return json_for_single_item_list(selection)


@app.route('/datadirs')
@apikey(shared=True)
@jsonp
def datadirs_for_user():
    user = access.get_user()
    rr = r.table('datadirs').filter({'owner': user})
    rr = add_all_arg_options(rr)
    selection = list(rr.run(g.conn, time_format='raw'))
    return json_as_format_arg(selection)


@app.route('/datadirs', methods=['POST'])
@apikey
@crossdomain(origin='*')
def create_datadir():
    user = access.get_user()
    j = request.get_json()
    project = dmutil.get_required('project', j)
    ddir = construct_datadir(j, user)
    if validate.project_id_exists(project, user) is None:
        return error.bad_request("Invalid request: bad project")
    if validate.datadir_id_exists(ddir.parent, user) is None:
        return error.bad_request(
            "Invalid request: parent does not exist %s" % (ddir.parent))
    ddir_exists = validate.datadir_id_exists(ddir.id, user)
    if ddir_exists is not None:
        return json_as_format_arg({'id': ddir_exists['id']})
    ddir_id = dmutil.insert_entry_id('datadirs', ddir.__dict__)
    proj2datadir = {'project_id': project, 'datadir_id': ddir_id}
    dmutil.insert_entry('project2datadir', proj2datadir)
    return json_as_format_arg({'id': ddir_id})


def construct_datadir(j, user):
    parent = dmutil.get_required('parent', j)
    access = dmutil.get_optional('access', j, "private")
    name = dmutil.get_required('name', j)
    return datadir.DataDir(name, access, user, parent)


@app.route('/datadirs/<datafile_id>/datafile')
@apikey
@jsonp
def get_datadir(datafile_id):
    rr = r.table('datadirs').filter(
        lambda drow: drow['datafiles'].contains(datafile_id))
    selection = list(rr.run(g.conn, time_format='raw'))
    return json_as_format_arg(selection)
