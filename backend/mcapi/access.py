import rethinkdb as r
import json
from flask import g, request
import mcexceptions
import apikeydb
import os


_user_access_matrix = {}

def check(user, owner, id ="Unknown"):
    if user == owner:
        return
    if _user_in_owner_group(user, owner):
        return
    raise mcexceptions.AccessNotAllowedException(id)

def _user_in_owner_group(user, owner):
    if owner not in _user_access_matrix:
        _load_user(owner)
    return _access_allowed(user, owner)

def _load_user(user):
    groups = list(r.table('usergroups').filter({'owner':user}).run(g.conn))
    _user_access_matrix[user] = {}
    # Load users in group into the list of users that can be accessed
    for group in groups:
        for username in group['users']:
            _user_access_matrix[user][username] = True

def _access_allowed(user, owner):
    return user in _user_access_matrix[owner]

def remove_user(user):
    if user in _user_access_matrix:
        _user_access_matrix.pop(user, None)

def check_ownership(usergroup, user):
    ug = r.table('usergroups').get(usergroup).run(g.conn)
    owners = json.dumps(ug['owner'])
    if not user in owners:
        raise mcexceptions.AccessNotAllowedException(user)

def get_apiuser():
    apikey = request.args.get('apikey')
    apiuser = apikeydb.apikey_user(apikey)
    return apiuser

def get_user():
    apiuser = get_apiuser()
    return request.args.get('user', default=apiuser)
