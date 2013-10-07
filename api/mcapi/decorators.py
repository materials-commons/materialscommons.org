from flask import request, make_response, jsonify, current_app, g
from functools import wraps, update_wrapper
from datetime import timedelta
import rethinkdb as r
import json

_apikeys = {}

def apikey(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        userApiKey = getUsersApiKey(kwargs['user'])
        apikey = request.args.get('apikey', False)
        if apikey <> userApiKey:
            return badkey()
        return f(*args, **kwargs)
    return decorated

def getUsersApiKey(username):
    if username in _apikeys:
        return _apikeys[username]
    else:
        user = r.table('users').get(username).run(g.conn)
        if user is None:
            return None
        else:
            _apikeys[username] = user['apikey']
            return user['apikey']

def removeUserFromApiKeyCache(username):
    if username in _apikeys:
        _apikeys.pop(username, None)

def badkey():
    return make_response(jsonify({'error': 'unauthorized access'}), 400)

def crossdomain(origin=None, methods=None, headers=None, max_age=21600, attach_to_all=True, automatic_options=True):
    if methods is not None:
        methods = ', '.join(sorted(x.upper() for x in methods))
    if headers is not None and not isinstance(headers, basestring):
        headers = ', '.join(x.upper() for x in headers)
    if not isinstance(origin, basestring):
        origin = ', '.join(origin)
    if isinstance(max_age, timedelta):
        max_age = max_age.total_seconds()

    def get_methods():
        if methods is not None:
            return methods
        options_resp = current_app.make_default_options_response()
        return options_resp.headers['allow']

    def decorator(f):
        def wrapped_function(*args, **kwargs):
            if automatic_options and request.method == 'OPTIONS':
                resp = current_app.make_default_options_response()
            else:
                resp = make_response(f(*args, **kwargs))
            if not attach_to_all and request.method != 'OPTIONS':
                return resp
            h = resp.headers
            h['Access-Control-Allow-Origin'] = origin
            h['Access-Control-Allow-Methods'] = get_methods()
            h['Access-Control-Max-Age'] = str(max_age)
            requestHeaders = request.headers.get('Access-Control-Request-Headers')
            if requestHeaders is not None:
                h['Access-Control-Allow-Headers'] = requestHeaders
            return resp

        f.provide_automatic_options = False
        f.required_methods=['OPTIONS']
        return update_wrapper(wrapped_function, f)
    return decorator

def jsonp(f):
    """Wraps JSONified output for JSONP """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        callback = request.args.get('callback', False)
        if callback:
            rv = f(*args, **kwargs)
            data_as_dict = json2dict(rv)
            if hasattr(rv, "status_code"):
                jsonpjson = {'status_code' : rv.status_code,\
                             'success' : is_successful(rv.status_code),\
                             'data': data_as_dict}
            else:
                jsonpjson = {'status_code': 200, 'success' : True, 'data': data_as_dict}
            content = str(callback) + '(' + json.dumps(jsonpjson) + ')'
            return current_app.response_class(content, mimetype='application/javascript')
        else:
            return f(*args, **kwargs)
    return decorated_function

def is_successful(status_code):
    return status_code < 299 and status_code >= 200

def json2dict(what):
    if hasattr(what, "status_code"):
        # Response object
        data = what.get_data()
        return json.loads(data)
    else:
        return json.loads(what)
