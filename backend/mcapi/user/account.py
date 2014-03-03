from ..mcapp import app
from ..decorators import crossdomain, apikey, jsonp
from .. import access
import json
from flask import jsonify, g, request
import rethinkdb as r
import uuid
from ..utils import make_password_hash, make_salted_password_hash
from ..args import json_as_format_arg
from .. import error
from .. import apikeydb
from .. import dmutil


@app.route('/user/<user>', methods=['GET'])
@apikey
@jsonp
def get_user_details(user):
    u = r.table('users').get(user).pluck('apikey', 'email', 'name').run(g.conn)
    return json_as_format_arg(u)


@app.route('/user/<user>/apikey', methods=['PUT'])
@crossdomain(origin='*')
def get_api_key_for_user(user):
    j = request.get_json()
    password = dmutil.get_required('password', j)
    u = r.table('users').get(user).run(g.conn)
    if u is None:
        return error.not_authorized("Bad username or password")
    dbpw = u['password']
    _i1, _i2,  _i3,  salt, _pwhash = dbpw.split('$')
    hash = make_salted_password_hash(password, salt)
    if hash == dbpw:
        return json.dumps({'apikey': u['apikey']})
    else:
        return error.not_authorized("Bad username or password")


@app.route('/users/init', methods=['PUT'])
@apikey
@jsonp
def user_init():
    apikeydb.reset()
    access.reset()
    return json_as_format_arg({"status": "success"})


@app.route('/user/<user>/password', methods=['PUT'])
@apikey
@crossdomain(origin='*')
def change_password(user):
    j = request.get_json()
    newpw = dmutil.get_required('password', j)
    hash = make_password_hash(newpw)
    rv = r.table('users').get(user).update({'password': hash}).run(g.conn)
    return jsonify(rv)


@app.route('/user/<user>/apikey/reset', methods=['PUT'])
@apikey
@crossdomain(origin='*')
def reset_apikey(user):
    new_apikey = uuid.uuid1().hex
    r.table('users').get(user).update({'apikey': new_apikey}).run(g.conn)
    access.remove_user(user)
    return jsonify({'apikey': new_apikey})


@app.route('/user/<user>/usergroups', methods=['GET'])
@apikey
@jsonp
def list_usergroups_for_user(user):
    res = list(r.table('usergroups').filter(r.row['users'].contains(user))
               .run(g.conn, time_format='raw'))
    return json.dumps(res)
