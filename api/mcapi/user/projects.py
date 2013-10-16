from ..mcapp import app
from ..decorators import crossdomain, apikey, jsonp
from flask import request, g
import rethinkdb as r
from .. import dmutil
from .. import args

@app.route('/v1.0/user/<user>/projects', methods=['GET'])
@apikey
@jsonp
def get_all_projects(user):
    rr = r.table('projects').filter({'owner': user})
    rr = args.add_all_arg_options(rr)
    items = list(rr.run(g.conn, time_format='raw'))
    return args.json_as_format_arg(items)
