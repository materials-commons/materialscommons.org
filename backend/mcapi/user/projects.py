from ..mcapp import app
from ..decorators import crossdomain, apikey
from flask import g, request
import rethinkdb as r
from .. import args
from .. import dmutil
from .. import validate
from loader.model import access as am
from loader.model import datadir, project
from .. import access


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

