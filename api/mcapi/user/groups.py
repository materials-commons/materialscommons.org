from ..mcapp import app
from ..decorators import crossdomain, apikey, jsonp
from flask import g, request
import rethinkdb as r
import json
from ..utils import createTagCount, error_response, Status
from ..access import checkAccessResponseSingle, checkDatafileAccess
from ..args import add_all_arg_options, json_as_format_arg, add_pluck_when_fields

@app.route('/v1.0/user/<user>/usergroups/neww', methods=['POST'])
@apikey
@crossdomain(origin='*')
def newusergroup(user):
    u_group = request.get_json(silent = False)
    exists = r.table('usergroups').get(u_group['name']).run(g.conn)
    if exists is None:
        new_u_group = {}
        new_u_group['name'] = u_group['name']
        new_u_group['description'] = u_group['description']
        new_u_group['access'] = u_group['access']
        new_u_group['id'] = u_group['name']
        new_u_group['users'] = u_group['users']
        new_u_group['owner'] = user
        #set_dates(new_u_group)
        selection = r.table('usergroups').insert(new_u_group).run(g.conn)
        if (selection[u'inserted'] == 1):
            return ''
    else:
        error_msg = error_response(423)
        return error_msg


