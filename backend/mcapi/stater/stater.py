from ..mcapp import app
from ..decorators import crossdomain, apikey, jsonp
import rethinkdb as r
from flask import request, g
import json
from .. import access
from .. import dmutil
from .. import utils
from .. import error
from .. import args


class State(object):
    def __init__(self, owner, name, description, type):
        self.owner = owner
        self.birthtime = r.now()
        self.mtime = self.birthtime
        self.name = name
        self.description = description
        self.type = type


class StateEncoder(json.JSONEncoder):
    def default(self, o):
        return o.__dict__


@app.route('/stater', methods=['POST'])
@crossdomain(origin='*')
@apikey
def create_new_state():
    j = request.get_json()
    user = access.get_user()
    name = dmutil.get_optional('name', j, user + "_state_" + utils.now_str())
    type = dmutil.get_required('type', j)
    description = dmutil.get_optional('description', j, "Save State for " + user)
    s = State(user, name, description, type)
    return dmutil.insert_entry('state', s.__dict__, return_created=True)


@app.route('/stater/<state_id>', methods=['PUT'])
@crossdomain(origin='*')
@apikey
def update_state(state_id):
    j = request.get_json()
    need_to_update = False
    attributes = dmutil.get_optional('attributes', j, None)
    name = dmutil.get_optional('name', j, None)
    description = dmutil.get_optional('description', j, None)
    attrs = {}
    if name:
        attrs['name'] = name
        need_to_update = True

    if description:
        attrs['description'] = description
        need_to_update = True

    if attributes:
        attrs['attributes'] = attributes
        need_to_update = True

    if need_to_update:
        attrs['mtime'] = r.now()
        rv = r.table('state').get(state_id).update(attrs).run(g.conn)
        if rv['errors'] != 0:
            return error.update_conflict("Unable to update state for id: %s" % (state_id))
    return args.json_as_format_arg({'id': state_id})


@app.route('/stater/update/<state_id>', methods=['PUT'])
@crossdomain(origin='*')
@apikey
def update_name_attributes(state_id):
    j = request.get_json()
    name = dmutil.get_optional('name', j, None)
    description = dmutil.get_optional('description', j, None)

    found_attrs = False
    if name:
        attrs['name'] = name
        found_attrs = True

    if description:
        attrs['description'] = description
        found_attrs = True

    if found_attrs:
        rv = r.table('state').get(state_id).update(attrs).run(g.conn)
        if rv['errors'] != 0:
            return error.update_conflict("Unable to update state for id: %s" %(state_id))
    return args.json_as_format_arg({'id': state_id})


@app.route('/stater/<state_id>', methods=['GET'])
@apikey
@jsonp
def get_state_for_id(state_id):
    state = dmutil.get_single_from_table('state', state_id, raw=True)
    if state['owner'] != access.get_user():
        return error.not_authorized("You are not authorized to access this state: %s" % (state_id))
    return args.json_as_format_arg(state)


@app.route('/stater', methods=['GET'])
@apikey
@jsonp
def get_all_state():
    return dmutil.get_all_from_table('state', filter_by={'owner': access.get_user()})


@app.route('/stater/<state_id>', methods=['DELETE'])
@crossdomain(origin='*')
@apikey
def delete_state(state_id):
    user = access.get_user()
    state = dmutil.get_single_from_table('state', state_id, raw=True)
    if state is None:
        error.not_found("No such id: %s" % (state_id))
    if state['owner'] != user:
        return error.not_authorized("You are not authorized to delete this state: %s" % (state_id))
    rv = r.table('state').get(state_id).delete().run(g.conn)
    if rv['deleted'] == 0:
        return error.database_error("Unable to delete state %s" % (state_id))
    return args.json_as_format_arg(state)


@app.route('/stater', methods=['DELETE'])
@apikey
def delete_all_state_for_user():
    user = access.get_user()
    rr = r.table('state').filter({'owner': user})
    rr = rr.for_each(lambda state: r.table('state').get(state['id']).delete())
    rv = rr.run(g.conn)
    if rv['errors'] != 0:
        return error.database_error("Unable to delete all items, the database returned an error")
    return json.dumps({'deleted': rv['deleted']})


@app.route('/stater/user/<user_id>', methods=['GET'])
@apikey
@jsonp
def get_state_for_user(user_id):
    selection = list(r.table('state').
                     filter({'owner': user_id}).
                     run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)
