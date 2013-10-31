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
    def __init__(self, owner, name, description):
        self.owner = owner
        self.birthtime = r.now()
        self.mtime = self.birthtime
        self.name = name
        self.description = description

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
    description = dmutil.get_optional('description', j, "Save State for " + user)
    s = State(user, name, description)
    return dmutil.insert_entry('state', s.__dict__)

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
    return dmutil.get_single_from_table('state', state_id)

@app.route('/stater', methods=['GET'])
@apikey
@jsonp
def get_all_state():
    return dmutil.get_all_from_table('state')
