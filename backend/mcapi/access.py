import rethinkdb as r
from flask import g, request
import mcexceptions
import apikeydb


_user_access_matrix = {}
_admins = []


def check(user, owner, id="Unknown"):
    if not allowed(user, owner, id):
        raise mcexceptions.AccessNotAllowedException(id)


def reset():
    global _admins
    _user_access_matrix.clear()
    _admins = []


def _user_in_owner_group(user, project_id):
    if is_administrator(user):
        return True
    elif project_id not in _user_access_matrix:
        _user_access_matrix[project_id] = []
        _user_in_owner_group(user, project_id)
    elif user not in _user_access_matrix[project_id]:
        _load_user(project_id)
    return _access_allowed(user, project_id)


def is_administrator(user):
    if not _admins:
        load_admins()
    for u in _admins:
        if u == user:
            return True
    return False


def get_admins():
    if not _admins:
        load_admins()
    return _admins


def load_admins():
    global _admins
    admin_group = list(r.table('users').get_all(True, index='admin')
                       .run(g.conn))
    if not admin_group:
        _admins = []
    else:
        for u in admin_group:
            _admins.append(u['id'])


def _load_user(project_id):
    users = list(r.table('access')
                  .get_all(project_id, index='project_id')
                  .pluck('user_id')
                  .run(g.conn))
    _user_access_matrix[project_id] = []
    for u in users:
            _user_access_matrix[project_id].append(u['user_id'])


def _access_allowed(user, project_id):
    if user in _user_access_matrix[project_id]:
        return True
    else:
        return False


def remove_user(user, project_id):
    if user in _user_access_matrix[project_id]:
        _user_access_matrix[project_id].pop(user, None)


def get_apiuser():
    apikey = request.args.get('apikey')
    apiuser = apikeydb.apikey_user(apikey)
    return apiuser


def get_user():
    apiuser = get_apiuser()
    return request.args.get('user', default=apiuser)


def allowed(user, owner, project_id):
    if user == owner:
        return True
    if _user_in_owner_group(user, project_id):
        return True
    else:
        return False
