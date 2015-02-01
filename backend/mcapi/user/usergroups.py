from ..mcapp import app
from ..decorators import crossdomain, apikey
from flask import g, request
import rethinkdb as r
from .. import error
from .. import dmutil
from .. import resp
from .. import args, access
from loader.model import access as am


@app.route('/access/new', methods=['POST'])
@apikey
@crossdomain(origin='*')
def create_access_r():
    j = request.get_json()
    access_entry = {}
    user_id = dmutil.get_required('user_id', j)
    project_id = dmutil.get_required('project_id', j)
    project_name = dmutil.get_required('project_name', j)
    access_entry = am.Access(user_id, project_id, project_name)
    result = dmutil.insert_entry('access', access_entry.__dict__,
                                 return_created=True)
    access.check(user_id, '', project_id)
    return resp.to_json(result)


@app.route('/access/<id>/remove', methods=['DELETE'])
@apikey
@crossdomain(origin='*')
def remove_access(id):
    item = dmutil.get_single_from_table('access', id, raw=True)
    if item is None:
        return error.not_found("No such access: %s" % id)
    else:
        rv = r.table('access').get(id).delete().run(g.conn)
        if rv['deleted'] == 0:
            return error.database_error("Unable to remove access %s" % (id))
    return args.json_as_format_arg(item)
