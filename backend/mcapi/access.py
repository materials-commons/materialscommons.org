import rethinkdb as r
import json
from flask import g
import mcexceptions

_user_access_matrix = {}

def check_access(user, owner, id):
    if user != owner or not _user_in_owner_group(user, owner):
        raise mcexceptions.AccessNotAllowedException(id)

def _user_in_owner_group(user, owner):
    if user not in _user_access_matrix:
        _load_user(user)
    return _access_allowed(user, owner)

def _load_user(user):
    groups = list(r.table('usergroups').filter(r.row['users'].contains(user)).run(g.conn))
    _user_access_matrix[user] = {}
    # Load users in group into the list of users that can be accessed
    for group in groups:
        for username in group['users']:
            _user_access_matrix[user][username] = True

def _access_allowed(user, owner):
    return owner in _user_access_matrix[user]

def remove_user(user):
    if user in _user_access_matrix:
        _user_access_matrix.pop(user, None)

def check_ownership(usergroup, user):
    ug = r.table('usergroups').get(usergroup).run(g.conn)
    owners = json.dumps(ug['owner'])
    if not user in owners:
        raise mcexceptions.AccessNotAllowedException(user)
