from ..mcapp import app
from ..decorators import crossdomain, apikey, jsonp
import json
from flask import g, request
import rethinkdb as r
from ..utils import set_dates
from .. import error
from .. import dmutil
from .. import args
from .. import access


@app.route('/usergroups/new', methods=['POST'])
@apikey
@crossdomain(origin='*')
def newusergroup():
    user = access.get_user()
    u_group = request.get_json(silent=False)
    exists = list(r.table('usergroups')
                  .get_all(u_group['name'], index='name')
                  .filter({'owner': user}).run(g.conn))
    if not exists:
        new_u_group = {}
        new_u_group['name'] = dmutil.get_required('name', u_group)
        new_u_group['description'] = dmutil.get_optional('description',
                                                         u_group)
        new_u_group['access'] = dmutil.get_optional('access', u_group)
        new_u_group['users'] = u_group['users']
        new_u_group['owner'] = user
        new_u_group['projects'] = dmutil.get_optional('projects', u_group, [])
        set_dates(new_u_group)
        return dmutil.insert_entry('usergroups', new_u_group)
    else:
        return error.bad_request("Usergroup already exists: " +
                                 u_group['name'])


@app.route('/usergroup/<usergroup>/datafiles')
@jsonp
def list_datafiles_by_usergroup(usergroup):
    selection = list(r.table('usergroups').filter({'id': usergroup}).
                     outer_join(
                         r.table('datafiles'),
                         lambda urow, drow: drow['owner'] in urow['users'])
                     .run(g.conn, time_format='raw'))
    return make_json_obj_for_join(selection, 'data')


def make_json_obj_for_join(selection, use_name):
    if not selection:
        return json.dumps(selection)
    obj = selection[0]['left']
    obj[use_name] = []
    for item in selection:
        obj[use_name].append(item['right'])
    return args.json_as_format_arg(obj)


@app.route('/usergroup/<usergroup>', methods=['GET'])
@apikey(shared=True)
@jsonp
def get_usergroup(usergroup):
    user = access.get_user()
    ugroup = r.table('usergroups').get(usergroup) \
                                  .run(g.conn, time_format='raw')
    if ugroup:
        access.check(user, ugroup['owner'])
        return args.json_as_format_arg(ugroup)
    else:
        error.bad_request("No such usergroup: %s" % (usergroup))


@app.route('/usergroup/<usergroup>/users', methods=['GET'])
@apikey(shared=True)
@jsonp
def list_users_by_usergroup(usergroup):
    user = access.get_user()
    ugroup = r.table('usergroups').get(usergroup)\
                                  .run(g.conn, time_format='raw')
    if ugroup:
        access.check(user, ugroup['owner'])
        return args.json_as_format_arg(ugroup)
    else:
        error.bad_request("No such usergroup: %s" % (usergroup))


@app.route('/usergroup/<usergroup_id>/selected_name/<selected_name>',
           methods=['PUT'])
@apikey
@crossdomain(origin='*')
def add_user_to_u_group(usergroup_id, selected_name):
    user = access.get_user()
    if user_in_usergroup(selected_name, usergroup_id):
        return error.not_acceptable("User %s already in group" %
                                    (selected_name))
    access.check_ownership(usergroup_id, user)
    updated_users_list = r.table('usergroups')\
                          .get(usergroup_id)['users']\
                          .append(selected_name).run(g.conn)
    r.table('usergroups').get(usergroup_id)\
                         .update({'users': updated_users_list}).run(g.conn)
    access.reset()
    return args.json_as_format_arg({'id': selected_name})


@app.route('/usergroup/<usergroup_id>/selected_name/<selected_name>/remove',
           methods=['PUT'])
@apikey
@crossdomain(origin='*')
def remove_user_from_usergroup(usergroup_id, selected_name):
    res = r.table('usergroups').get(usergroup_id)['users']\
                               .difference([selected_name]).run(g.conn)
    r.table('usergroups').get(usergroup_id).update({'users': res}).run(g.conn)
    ugroup = r.table('usergroups').get(usergroup_id)\
                                  .run(g.conn, time_format='raw')
    access.reset()
    return args.json_as_format_arg(ugroup)


def user_in_usergroup(user, usergroup):
    ugroup = r.table('usergroups').get(usergroup).run(g.conn)
    if ugroup:
        return user in ugroup['users']
    return False


@app.route('/usergroup/<usergroup_id>/project/<project_id>',
           methods=['PUT'])
@apikey
@crossdomain(origin='*')
def add_project(usergroup_id, project_id):
    project = r.table('projects').get(project_id).run(g.conn)
    updated_projects_list = r.table('usergroups').get(usergroup_id)['projects'].append({'id': project["id"], 'name': project["name"]}).run(g.conn)
    r.table('usergroups').get(usergroup_id).update({'projects': updated_projects_list }).run(g.conn)
    return args.json_as_format_arg({'id': project['name']})


@app.route('/usergroup/<usergroup_id>/project/<project_id>/remove',
           methods=['PUT'])
@apikey
@crossdomain(origin='*')
def remove_project(usergroup_id, project_id):
    project = r.table('projects').get(project_id).run(g.conn)
    res = r.table('usergroups').get(usergroup_id)['projects']\
                               .difference([{'id': project["id"], 'name': project["name"]}]).run(g.conn)
    r.table('usergroups').get(usergroup_id).update({'projects': res}).run(g.conn)
    ugroup = r.table('usergroups').get(usergroup_id)\
                                  .run(g.conn, time_format='raw')
    access.reset()
    return args.json_as_format_arg(ugroup)



