from mcapp import app
from decorators import crossdomain, apikey, jsonp
import json
from flask import jsonify, g, make_response
import rethinkdb as r

@app.route('/v1.0/test/abcuser/<user>', methods=['PUT', 'GET'])
@crossdomain(origin='*')
#@apikey
def my_abc_user(user):
    print "my_abc_user: " + user
    return jsonify({'who2': 'my_abc_user'})

@app.route('/v1.0/test/users')
def t_users():
    selection = list(r.table('users').run(g.conn))
    return json.dumps(selection)

@app.route('/v1.0/abc', methods=['POST'])
@crossdomain(origin='*')
#@apikey
def my_abc():
    print "my_abc"
    return jsonify({'what': 'PUT'})

@app.route('/v1.0/abc', methods = ['GET'])
@jsonp
def my_abc_get():
    print "my_abc_get"
    return jsonify({'what': 'GET'})

@app.route('/v1.0/user/<user>/apikey')
@apikey
def apikey_test(user):
    print "apikey_test"
    return jsonify({'apikey': 'success'})

@app.route('/v1.0/error')
@jsonp
def jsonp_error():
    return make_response(jsonify({'error' : 'no access'}), 403)

@app.route('/v1.0/str')
@jsonp
def str_as_return():
    return json.dumps({'hello': 'world'})
