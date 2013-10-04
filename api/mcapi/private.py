from mcapp import app
from decorators import crossdomain, apikey, jsonp
import json
from flask import g, jsonify, request
import rethinkdb as r

@app.route('/v1.0/private/users', methods = ['GET'])
@jsonp
def get_users():
    selection = list(r.table('users').pluck('name', 'id').run(g.conn))
    return json.dumps(selection)

@app.route('/v1.0/private/user/<user>', methods = ['GET'])
@jsonp
@apikey
def get_user(user):
    u = r.table('users').get(user).pluck('name', 'id', 'apikey').run(g.conn)
    return jsonify(u)

@app.route('/v1.0/private/user', methods=['PUT'])
@crossdomain(origin='*')
@apikey
def update_user():
    user = request.get_json()
    rv = r.table('users').update(user).run(g.conn)
    return jsonify(rv)

@app.route('/v1.0/private/user', methods=['DELETE'])
@crossdomain(origin='*')
@apikey
def delete_user(user):
    # What to do about all the data the user has?
    rv = r.table('users').get(user).delete().run(g.conn)
    return jsonify(rv)

@app.route('/v1.0/private/user/<user>/selected_users', methods = ['GET'])
@jsonp
@apikey
def selected_users_from_usergroups(user):
    allowedUsers = list(r.table('usergroups')\
                        .filter(r.row['users'].contains(user))\
                        .concat_map(lambda g: g['users']).distinct().difference([user]).run(g.conn))
    return json.dumps(allowedUsers)
