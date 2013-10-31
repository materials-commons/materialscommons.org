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
    attributes = dmutil.get_required('attributes', j)
    state = r.table('state').get(state_id).run(g.conn)
    mtime = r.now()
    if not state:
        return error.bad_request("No such state with id: %s" % (state_id))
    rv = r.table('state').get(state_id).update({'mtime': mtime, 'attributes': attributes}).run(g.conn)
    if rv['errors'] != 0:
        return error.update_conflict("Unable to update state for id: %s" % (state_id))
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
@apikey
def delete_state(state_id):
    user = access.get_user()
    state = dmutil.get_single_from_table('state', state_id, raw=True)
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
    rr = r.table('state').filter({'owner':user})
    rr = rr.for_each(lambda state: r.table('state').get(state['id']).delete())
    rv = rr.run(g.conn)
    if rv['errors'] != 0:
        return error.database_error("Unable to delete all items, the database returned an error")
    return json.dumps({'deleted': rv['deleted']})
