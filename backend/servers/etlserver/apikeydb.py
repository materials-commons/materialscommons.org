import threading

from .DB import DbConnection

_lock = threading.Lock()
_apikeys = {}


def valid_apikey(apikey):
    if not _apikeys:
        _load_apikeys()
    return apikey in _apikeys


def _load_apikeys():
    conn = DbConnection().connection()
    r = DbConnection().interface()
    _lock.acquire()
    try:
        _apikeys.clear()
        users = list(r.table('users').run(conn))
        for user in users:
            _apikeys[user['id']] = user['apikey']
            _apikeys[user['apikey']] = user['id']
    finally:
        _lock.release()


# noinspection PyUnusedLocal
def remove_apikey(apikey):
    _apikeys.clear()


def apikey_user(apikey):
    return _lookup_key(apikey)


def user_apikey(user):
    return _lookup_key(user)


def _lookup_key(what):
    if what in _apikeys:
        return _apikeys[what]
    return None


def reset():
    global _apikeys
    _apikeys = {}
