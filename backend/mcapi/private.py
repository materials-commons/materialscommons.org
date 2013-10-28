from mcapp import app
from decorators import crossdomain, apikey, jsonp
import json
from flask import g, jsonify, request
import rethinkdb as r
import access

@app.route('/private/users', methods = ['GET'])
@apikey
@jsonp
def get_users():
    selection = list(r.table('users').pluck('name', 'id').run(g.conn))
    return json.dumps(selection)

@app.route('/private/user/<user>', methods = ['GET'])
@apikey
@jsonp
def get_user(user):
    u = r.table('users').get(user).pluck('name', 'id', 'apikey').run(g.conn)
    return jsonify(u)

@app.route('/private/user', methods=['PUT'])
@apikey
@crossdomain(origin='*')
def update_user():
    user = request.get_json()
    rv = r.table('users').update(user).run(g.conn)
    return jsonify(rv)

@app.route('/selected_users', methods = ['GET'])
@apikey
@jsonp
def selected_users_from_usergroups(user):
    user = access.get_user()
    allowedUsers = list(r.table('usergroups')\
                        .filter(r.row['users'].contains(user))\
                        .concat_map(lambda g: g['users']).distinct().difference([user]).run(g.conn))
    return json.dumps(allowedUsers)
