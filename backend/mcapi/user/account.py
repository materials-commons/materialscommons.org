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
from .. import args


@app.route('/user/<user>/apikey', methods=['PUT'])
@crossdomain(origin='*')
def get_api_key_for_user(user):
    j = request.get_json()
    password = dmutil.get_required('password', j)
    u = r.table('users').get(user).run(g.conn, time_format='raw')
    if u is None:
        return error.not_authorized("Bad username or password")
    dbpw = u['password']
    if dbpw == '':
        return error.not_authorized("Bad username")
    _i1, _i2,  _i3,  salt, _pwhash = dbpw.split('$')
    hash = make_salted_password_hash(password, salt)
    if hash == dbpw:
        del u['password']
        r.table('users').get(user).update({'last_login': r.now()}).run(g.conn)
        return json.dumps(u)
    else:
        return error.not_authorized("Bad username or password")


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


@app.route('/users/<user>', methods=['PUT'])
@apikey
@crossdomain(origin='*')
def update(user):
    j = request.get_json()
    fullname = dmutil.get_optional('fullname', j)
    if fullname:
        rv = r.table('users').get(user).update({'fullname': fullname})\
                                       .run(g.conn)
        return jsonify(rv)
    return error.bad_request("Expected field not specified")


@app.route('/user/<user>/preferred_templates', methods=['GET'])
@apikey
@jsonp
def preferred_templates(user):
    u_obj = r.table('users').get(user).pluck('preferences').run(g.conn)
    return args.json_as_format_arg(u_obj)


@app.route('/user/<user>/templates', methods=['PUT'])
@apikey
@crossdomain(origin='*')
def update_preferred_templates(user):
    j = request.get_json()
    list = dmutil.get_required('templates', j)
    rv = r.table('users').get(user).update(
        {'preferences': {'templates': list}}).run(g.conn)
    return jsonify(rv)


@app.route('/user/<user>/tags', methods=['GET'])
@apikey
@jsonp
def get_user_tags(user):
    user_obj = r.table('users').get(user).pluck('preferences').run(g.conn)
    return args.json_as_format_arg(user_obj)


@app.route('/user/<user>/tags', methods=['PUT'])
@apikey
@crossdomain(origin='*')
def update_tags(user):
    user_obj = r.table('users').get(user).run(g.conn)
    existing_tags = user_obj['preferences']['tags']
    j = request.get_json()
    tag = dict()
    tag['name'] = dmutil.get_required('name', j)
    tag['color'] = dmutil.get_required('color', j)
    tag['icon'] = dmutil.get_required('icon', j)
    tag['description'] = dmutil.get_optional('description', j)
    existing_tags.append(tag)
    rr = r.table('users').get(user).update(
        {'preferences': {'tags': existing_tags}}).run(g.conn)
    return jsonify(rr)


@app.route('/user/ui', methods=['GET'])
@apikey
@jsonp
def get_user_ui_setup():
    user = access.get_user()
    ui = r.table('ui').get(user).run(g.conn, time_format='raw')
    if ui is None:
        return error.not_found("No state for user")
    return jsonify(ui)


@app.route('/user/ui', methods=['POST'])
@apikey
def update_user_ui_setup():
    user = access.get_user()
    j = request.get_json()
    exists = r.table('ui').get(user).run(g.conn)
    if exists is None:
        r.table('ui').insert(j).run(g.conn)
    else:
        r.table('ui').get(user).replace(j).run(g.conn)
    return jsonify({'id': user})
