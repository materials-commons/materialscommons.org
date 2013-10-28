from ..mcapp import app
from ..decorators import crossdomain, apikey
from flask import g, request
import rethinkdb as r
from .. import access
from .. import error
from .. import dmutil

@app.route('/usergroups/new', methods=['POST'])
@apikey
@crossdomain(origin='*')
def newusergroup():
    user = access.get_group()
    u_group = request.get_json(silent=False)
    exists = r.table('usergroups').get(u_group['name']).run(g.conn)
    if exists is None:
        new_u_group = {}
        new_u_group['name'] = u_group['name']
        new_u_group['description'] = u_group['description']
        new_u_group['access'] = u_group['access']
        new_u_group['id'] = u_group['name']
        new_u_group['users'] = u_group['users']
        new_u_group['owner'] = user
        return dmutil.insert_entry('usergroups', new_u_group)
    else:
        return error.bad_request("Usergroup already exists: %s" % (u_group['name']))
