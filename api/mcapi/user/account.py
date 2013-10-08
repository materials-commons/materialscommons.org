from ..mcapp import app
from ..decorators import crossdomain, apikey, jsonp, remove_user_from_apikey_cache
import json
from flask import jsonify, g
import rethinkdb as r
import uuid
from ..utils import makePwHash, makePwHashWithSalt, error_response
from ..args import json_as_format_arg

@app.route('/v1.0/user/<user>', methods=['GET'])
@apikey
@jsonp
def get_user_details(user):
    u = r.table('users').get(user).pluck('apikey', 'email', 'name').run(g.conn)
    return json_as_format_arg(u)

@app.route('/v1.0/user/<user>/<password>/apikey')
@jsonp
def get_api_key_for_user(user, password):
    u = r.table('users').get(user).run(g.conn)
    dbpw = u['password']
    _i1,_i2, _i3, salt, _pwhash = dbpw.split('$')
    hash = makePwHashWithSalt(password, salt)
    if hash == dbpw:
        return json.dumps({'apikey': u['apikey']})
    else:
        error_msg = error_response(400)
        return error_msg

@app.route('/v1.0/user/<user>/password/<newpw>', methods=['PUT'])
@apikey
@crossdomain(origin='*')
def change_password(user, newpw):
    hash = makePwHash(newpw)
    rv = r.table('users').get(user).update({'password':hash}).run(g.conn)
    return jsonify(rv)

@app.route('/v1.0/user/<user>/apikey/reset', methods=['PUT'])
@apikey
@crossdomain(origin='*')
def reset_apikey(user):
    new_apikey = uuid.uuid1().hex
    rv = r.table('users').get(user).update({'apikey':new_apikey}).run(g.conn)
    remove_user_from_apikey_cache(user)
    return jsonify({'apikey':new_apikey})

@app.route('/v1.0/user/<user>/usergroups', methods=['GET'])
@apikey
@jsonp
def list_usergroups_for_user(user):
    res = list(r.table('usergroups').filter(r.row['users'].contains(user))\
               .run(g.conn, time_format='raw'))
    return json.dumps(res)

@app.route('/v1.0/user/<user>/all_usergroups', methods=['GET'])
@apikey
@jsonp
def list_all_usergroups(user):
    res = list(r.table('usergroups').run(g.conn, time_format='raw'))
    return json.dumps(res)
