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
    u_group = request.get_json(silent = False)
    exists = r.table('usergroups').get(u_group['name']).run(g.conn)
    if exists is None:
        new_u_group = {}
        new_u_group['name'] = u_group['name']
        new_u_group['description'] = u_group['description']
        new_u_group['access'] = u_group['access']
        new_u_group['id'] = u_group['name']
        new_u_group['users'] = u_group['users']
        new_u_group['owner'] = user
        set_dates(new_u_group)
        return dmutil.insert_entry('usergroups', new_u_group)
    else:
        return error.bad_request("Usergroup already exists: " + u_group['name'])

@app.route('/usergroup/<usergroup>/datafiles')
@jsonp
def list_datafiles_by_usergroup(usergroup):
    selection = list(r.table('usergroups').filter({'id':usergroup}).outer_join(\
            r.table('datafiles'), lambda urow, drow: drow['owner'] in urow['users'])\
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
    selection = r.table('usergroups').get(usergroup).run(g.conn, time_format='raw')
    return args.json_as_format_arg(selection)

@app.route('/usergroup/<usergroup>/users', methods=['GET'])
@apikey(shared=True)
@jsonp
def list_users_by_usergroup(usergroup):
    user = access.get_user()
    ugroup = r.table('usergroups').get(usergroup).run(g.conn, time_format='raw')
    if ugroup:
        access.check(user, ugroup['owner'])
        return args.json_as_format_arg(ugroup)
    else:
        error.bad_request("No such usergroup: %s" % (usergroup))

@app.route('/usergroup/<usergroup>/selected_name/<selected_name>', methods=['PUT'])
@apikey
@crossdomain(origin='*')
def add_user_to_u_group(usergroup, selected_name):
    user = access.get_user()
    if user_in_usergroup(selected_name, usergroup):
        return error.not_acceptable("User %s already in group %s" % (selected_name, usergroup))
    access.check_ownership(usergroup, user)
    updated_users_list = r.table('usergroups').get(usergroup)['users'].append(selected_name).run(g.conn)
    r.table('usergroups').get(usergroup).update({'users': updated_users_list}).run(g.conn)
    return args.json_as_format_arg({'id': selected_name})


@app.route('/usergroup/<usergroup>/selected_name/<selected_name>/remove',\
           methods=['PUT'])
@apikey
@crossdomain(origin='*')
def remove_user_from_usergroup(usergroup, selected_name):
    user = access.get_user()
    res = r.table('usergroups').get(usergroup)['users'].difference([selected_name]).run(g.conn)
    r.table('usergroups').get(usergroup).update({'users': res}).run(g.conn)
    return args.json_as_format_arg({'id': selected_name})

def user_in_usergroup(user, usergroup):
    ugroup = r.table('usergroups').get(usergroup).run(g.conn)
    if ugroup:
        return user in ugroup['users']
    return False
