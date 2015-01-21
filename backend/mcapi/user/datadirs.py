from ..mcapp import app
from ..decorators import apikey, jsonp, crossdomain
from .. import resp
from flask import g, request
import rethinkdb as r
from ..utils import json_for_single_item_list
from ..args import add_all_arg_options, json_as_format_arg
from .. import access
from ..import dmutil
from ..import error
from ..import validate
from loader.model import datadir
from projects import DItem2


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
    project_id = dmutil.get_required('project_id', j)
    level = dmutil.get_required('level', j)
    proj = validate.project_id_exists(project_id, user)
    if proj is None:
        return error.bad_request("Invalid request: bad project")
    ddir = construct_datadir(j, proj['owner'])
    if validate.datadir_id_exists(ddir.parent, user) is None:
        return error.bad_request(
            "Invalid request: parent does not exist %s" % (ddir.parent))
    ddir_exists = validate.datadir_path_exists(ddir.name, project_id)
    if ddir_exists:
        return error.bad_request(
            "Invalid request: datadir already exists")
    ddir_new = dmutil.insert_entry('datadirs', ddir.__dict__, return_created=True)
    ddir.id = ddir_new['id']
    ddir.birthtime = ddir_new['birthtime']
    ddir.mtime = ddir_new['mtime']
    ddir.atime = ddir_new['atime']
    proj2datadir = {'project_id': project_id, 'datadir_id': ddir_new['id']}
    dmutil.insert_entry('project2datadir', proj2datadir)
    ditem = DItem2(ddir.id, ddir.name, "datadir",
                   ddir_new['owner'], ddir_new['birthtime'], level)
    return resp.to_json(ditem.__dict__)


def construct_datadir(j, user):
    parent = dmutil.get_required('parent', j)
    name = dmutil.get_required('name', j)
    return datadir.DataDir(name, user, parent, "")


@app.route('/datadirs/<datafile_id>/datafile')
@apikey
@jsonp
def get_datadir(datafile_id):
    rr = r.table('datadirs').filter(
        lambda drow: drow['datafiles'].contains(datafile_id))
    selection = list(rr.run(g.conn, time_format='raw'))
    return json_as_format_arg(selection)
