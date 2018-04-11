from flask import request, g
from functools import wraps, partial
from . import apikeydb
from . import error
from . import access
from . import mcexceptions
from materials_commons.api import _Config as Config
from materials_commons.api import _Remote as Remote
from materials_commons.api import _set_remote as set_remote


def apikey(method=None, shared=False):
    if method is None:
        return partial(apikey, shared=shared)

    @wraps(method)
    def wrapper(*args, **kwargs):
        apikey = request.args.get('apikey', default="no_such_key")
        if not apikeydb.valid_apikey(apikey):
            return error.not_authorized(
                "You are not authorized to access the system")
        apiuser = access.get_apiuser()
        user = request.args.get('user', default=apiuser)
        if shared:
            access.check(apiuser, user)
        elif apiuser != user:
            raise mcexceptions.AccessNotAllowedException()
        set_global_python_api_remote(apikey)
        return method(*args, **kwargs)

    return wrapper


def set_global_python_api_remote(apikey):
    config = Config(override_config={
        "apikey": apikey,
        "mcurl": "http://mcdev.localhost/api"
    })
    remote = Remote(config=config)
    set_remote(remote)
