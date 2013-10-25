from ..mcapp import app
from ..decorators import crossdomain, apikey, jsonp
import json
from flask import g, request
import rethinkdb as r
from ..utils import set_dates
from .. import error
from .. import dmutil
from .. import args

@app.route('/v1.0/user/<user>/usergroups/neww', methods=['POST'])
@apikey
@crossdomain(origin='*')
def newusergroup(user):
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

@app.route('/v1.0/usergroup/<usergroup>/datafiles')
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

@app.route('/v1.0/user/<user>/usergroup/<usergroup>', methods=['GET'])
@apikey
@jsonp
def get_usergroup(user,usergroup):
    selection = r.table('usergroups').get(usergroup).run(g.conn, time_format='raw')
    return args.json_as_format_arg(selection)

@app.route('/v1.0/user/<user>/usergroup/<usergroup>/users', methods=['GET'])
@apikey
@jsonp
def list_users_by_usergroup(user, usergroup):
    selection = list(r.table('usergroups').filter({'id':usergroup}).run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)

@app.route('/v1.0/user/<user>/usergroup/<usergroup>/selected_name/<selected_name>', methods=['PUT'])
@apikey
@crossdomain(origin='*')
def add_user_to_u_group(user, usergroup, selected_name):
    exists = does_user_exists_in_ugroup(selected_name, usergroup)
    if exists is None:
        access.check_ownership(usergroup, user)
        res = r.table('usergroups').get(usergroup)['users'].append(selected_name).run(g.conn)
        r.table('usergroups').get(usergroup).update({'users': res}).run(g.conn)
        return args.json_as_format_arg({'id': user})
    else:
        return error.not_acceptable("User %s already in group %s" % (user, usergroup))

@app.route('/v1.0/user/<user>/usergroup/<usergroup>/selected_name/<selected_name>/remove',\
           methods=['PUT'])
@apikey
@crossdomain(origin='*')
def remove_user_from_usergroup(user, usergroup, selected_name):
    res = r.table('usergroups').get(usergroup)['users'].difference([selected_name]).run(g.conn)
    r.table('usergroups').get(usergroup).update({'users': res}).run(g.conn)
    return args.json_as_format_arg({'id': user})

def does_user_exists_in_ugroup(user, usergroup):
    ugroup = r.table('usergroups').get(usergroup).run(g.conn)
    users = ugroup['users']
    return user in users
