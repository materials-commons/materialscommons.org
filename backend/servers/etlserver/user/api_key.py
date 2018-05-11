from flask import request
from functools import wraps, partial
from . import apikeydb
from . import access
from ..utils import error
from ..utils import mcexceptions
# noinspection PyProtectedMember
from materials_commons.api import _Config as Config
# noinspection PyProtectedMember
from materials_commons.api import _Remote as Remote
# noinspection PyProtectedMember
from materials_commons.api import _set_remote as set_remote


def apikey(method=None, shared=False):
    if method is None:
        return partial(apikey, shared=shared)

    @wraps(method)
    def wrapper(*args, **kwargs):
        api_key = request.args.get('apikey', default="no_such_key")
        if not apikeydb.valid_apikey(api_key):
            return error.not_authorized(
                "You are not authorized to access the system")
        apiuser = access.get_apiuser()
        user = request.args.get('user', default=apiuser)
        if shared:
            access.check(apiuser, user)
        elif apiuser != user:
            raise mcexceptions.AccessNotAllowedException()
        set_global_python_api_remote(api_key)
        return method(*args, **kwargs)

    return wrapper


def set_global_python_api_remote(api_key):
    config = Config(override_config={
        "apikey": api_key,
    })
    remote = Remote(config=config)
    set_remote(remote)
