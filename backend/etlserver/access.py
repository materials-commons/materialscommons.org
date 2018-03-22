from flask import request
from .mcexceptions import AccessNotAllowedException
from . import apikeydb
from .DB import DbConnection

_user_access_matrix = {}
_admins = []


def check(user, owner, project_id="Unknown"):
    if not allowed(user, owner, project_id):
        raise AccessNotAllowedException(project_id)


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
    conn = DbConnection().connection()
    r = DbConnection().interface()
    admin_group = list(r.table('users').get_all(True, index='admin')
                       .run(conn))
    if not admin_group:
        _admins = []
    else:
        for u in admin_group:
            _admins.append(u['id'])


def _load_user(project_id):
    conn = DbConnection().connection()
    r = DbConnection().interface()
    users = list(r.table('access')
                 .get_all(project_id, index='project_id')
                 .pluck('user_id')
                 .run(conn))
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
    api_user = apikeydb.apikey_user(apikey)
    return api_user


def get_user():
    return get_apiuser()


def allowed(user, owner, project_id):
    if user == owner:
        return True
    if _user_in_owner_group(user, project_id):
        return True
    else:
        return False
