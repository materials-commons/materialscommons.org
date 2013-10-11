from ..mcapp import app
from ..decorators import crossdomain, apikey, jsonp
import json
from flask import g, request
import rethinkdb as r
from ..utils import error_response, set_dates

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
    return json.dumps(obj)

@app.route('/v1.0/user/<user>/usergroup/<usergroup>', methods=['GET'])
@apikey
@jsonp
def get_usergroup(user,usergroup):
    selection = r.table('usergroups').get(usergroup).run(g.conn, time_format='raw')
    return json.dumps(selection)


@app.route('/v1.0/user/<user>/usergroup/<usergroup>/users', methods=['GET'])
@apikey
@jsonp
def list_users_by_usergroup(user, usergroup):
    selection = list(r.table('usergroups').filter({'id':usergroup}).run(g.conn, time_format='raw'))
    return json.dumps(selection)

@app.route('/v1.0/user/<user>/usergroup/<usergroup>/selected_name/<selected_name>', methods=['PUT'])
@apikey
@crossdomain(origin='*')
def add_user_to_u_group(user, usergroup, selected_name):
    exists = does_user_exists_in_ugroup(selected_name, usergroup)
    if exists is None:
        permission = checkOwnership(usergroup, user)
        if permission == True:
            res = r.table('usergroups').get(usergroup)['users'].append(selected_name).run(g.conn)
            r.table('usergroups').get(usergroup).update({'users': res}).run(g.conn)
            return json.dumps(res)
        else:
            error_msg = error_response(407)
            return error_msg
    else:
        error_msg = error_response(406)
        return error_msg

@app.route('/v1.0/user/<user>/usergroup/<usergroup>/selected_name/<selected_name>/remove', methods=['PUT'])
@apikey
@crossdomain(origin='*')
def remove_user_from_usergroup(user, usergroup, selected_name):
    res = r.table('usergroups').get(usergroup)['users'].difference([selected_name]).run(g.conn)
    r.table('usergroups').get(usergroup).update({'users': res}).run(g.conn)
    return json.dumps(res)

@app.route('/v1.0/user/<user>/usergroups/new', methods=['POST'])
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
        selection = r.table('usergroups').insert(new_u_group).run(g.conn)
        if (selection[u'inserted'] == 1):
            return ''
    else:
        error_msg = error_response(401)
        return error_msg

def does_user_exists_in_ugroup(user, usergroup):
    ug = r.table('usergroups').get(usergroup).run(g.conn)
    users = json.dumps(ug['users'])
    if user in users:
        return True
