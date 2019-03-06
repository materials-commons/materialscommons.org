from ..mcapp import app
from ..decorators import crossdomain, apikey, jsonp
from .. import access
import json
from flask import jsonify, g, request
import rethinkdb as r
import uuid
from ..utils import make_password_hash, make_salted_password_hash
from .. import error
from .. import dmutil


@app.route('/user/rvalidate/<validation_id>/finish', methods=['POST'])
def finish_reset_password(validation_id):
    cursor = r.table("users").get_all(validation_id, index='validate_uuid').run(g.conn)
    u = ''
    for document in cursor:
        u = document
    if not u:
        return error.not_authorized('There is no validated user record. Please retry')
    user_id = u['id']
    j = request.get_json()
    password = dmutil.get_required('password', j)
    hash = make_password_hash(password)
    rv = r.table('users').get(user_id).update({'password': hash}, return_changes=True).run(g.conn)
    user = rv['changes'][0]['new_val']
    r.table('users').get(user_id).replace(r.row.without('reset_password', 'validate_uuid')).run(g.conn)
    ## Return something that doesn't contain the password hash, uuid, and flag
    del user['password']
    del user['validate_uuid']
    del user['reset_password']
    return jsonify({'data': user})


@app.route('/user/<user>/password', methods=['PUT'])
@apikey
@crossdomain(origin='*')
def change_password(user):
    j = request.get_json()
    newpw = dmutil.get_required('password', j)
    hash = make_password_hash(newpw)
    rv = r.table('users').get(user).update({'password': hash}).run(g.conn)
    return jsonify(rv)


@app.route('/user/<user>/validate/<validation_id>/password', methods=['POST'])
def reset_password_validate(user, validation_id):
    cursor = r.table("account_requests").get_all(validation_id, index='validate_uuid').run(g.conn)
    u = ''
    for document in cursor:
        u = document
    if not u:
        return error.not_authorized('No record of this registration was found')
    user_id = u['id']
    if not user_id:
        return error.not_authorized('No valid user was found')
    j = request.get_json()
    newpw = dmutil.get_required('password', j)
    hash = make_password_hash(newpw)
    r.table('account_requests').get(user_id).delete().run(g.conn)
    rv = r.table('users').get(user_id).update({'password': hash}).run(g.conn)
    return jsonify(rv)


@app.route('/user/<user>/apikey/reset', methods=['PUT'])
@apikey
@crossdomain(origin='*')
def reset_apikey(user):
    new_apikey = uuid.uuid1().hex
    r.table('users').get(user).update({'apikey': new_apikey}).run(g.conn)
    access.reset()
    return jsonify({'apikey': new_apikey})


@app.route('/users', methods=['GET'])
@jsonp
def list_users():
    selection = list(r.table('users').pluck('id', 'fullname').run(g.conn))
    return json.dumps(selection)
