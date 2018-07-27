from flask import request
from functools import wraps, partial
from . import apikeydb
from . import access
from ..utils import error
from ..utils import mcexceptions


def apikey(method=None, shared=False):
    if method is None:
        return partial(apikey, shared=shared)

    @wraps(method)
    def wrapper(*args, **kwargs):
        api_key = request.args.get('apikey', default="no_such_key")
        if not apikeydb.valid_apikey(api_key):
            return error.not_authorized(
                "You are not authorized to access the system")
        api_user = access.get_apiuser()
        user = request.args.get('user', default=api_user)
        if shared:
            access.check(api_user, user)
        elif api_user != user:
            raise mcexceptions.AccessNotAllowedException()
        return method(*args, **kwargs)

    return wrapper
