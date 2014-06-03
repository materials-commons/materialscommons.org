import rethinkdb as r
from flask import g, request
import mcexceptions
import apikeydb


_user_access_matrix = {}
_admins = []


def check(user, owner, id="Unknown"):
    if not allowed(user, owner):
        raise mcexceptions.AccessNotAllowedException(id)


def reset():
    _user_access_matrix.clear()


def _user_in_owner_group(user, owner):
    if is_administrator(user):
        return True
    elif owner not in _user_access_matrix:
        _load_user(owner)
    return _access_allowed(user, owner)


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
    admin_group = r.table('usergroups').get('admin').run(g.conn)
    if admin_group is None:
        _admins = ['gtarcea@umich.edu', 'tammasr@umich.edu']
    else:
        for u in admin_group['users']:
            _admins.append(u)


def _load_user(user):
    groups = list(r.table('usergroups').filter({'owner': user}).run(g.conn))
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
    if ug is None:
        return
    if user != ug['owner']:
        raise mcexceptions.AccessNotAllowedException(user)


def get_apiuser():
    apikey = request.args.get('apikey')
    apiuser = apikeydb.apikey_user(apikey)
    return apiuser


def get_user():
    apiuser = get_apiuser()
    return request.args.get('user', default=apiuser)


def allowed(user, owner):
    if user == owner:
        return True
    if _user_in_owner_group(user, owner):
        return True
    else:
        return False
