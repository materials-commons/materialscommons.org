from ..mcapp import app
from ..decorators import crossdomain, apikey, jsonp
from flask import g, request
import rethinkdb as r
from ..utils import createTagCount
from .. import args 
from .. import error
from .. import access

@app.route('/v1.0/user/<user>/datafiles')
@apikey
@jsonp
def datafiles_for_user(user):
    rr = r.table('datafiles').filter({'owner':user})
    rr = args.add_all_arg_options(rr)
    selection = list(rr.run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)

@app.route('/v1.0/user/<user>/datafiles/tag/<tag>')
@apikey
@jsonp
def datafiles_for_user_by_tag(user, tag):
    rr = r.table('datafiles').filter({'owner':user}).filter(r.row['tags'].contains(tag))
    rr = args.add_all_arg_options(rr)
    selection = list(rr.run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)

@app.route('/v1.0/user/<user>/datafile/update/<path:datafileid>', methods=['PUT'])
@apikey
@crossdomain(origin='*')
def update_datafile_for_user(user, datafileid):
    df = r.table('datafiles').get(datafileid).run(g.conn)
    status = access.check(user, df['owner'], df['id'])
    rv = r.table('datafiles').get(datafileid).update(request.json).run(g.conn)
    if (rv['replaced'] == 1 or rv['unchanged'] == 1):
        return ''
    else:
        error.update_conflict("Unable to update datafile: " + datafileid)

@app.route('/v1.0/user/<user>/tags/count')
@apikey
@jsonp
def tags_by_count_for_user(user):
    selection = list(r.table('datafiles').filter({'owner':user})\
                     .concat_map(lambda item: item['tags']).run(g.conn))
    return createTagCount(selection)

@app.route('/v1.0/user/<user>/datafile/<datafileid>')
@apikey
@jsonp
def datafile_for_user_by_id(user, datafileid):
    rr = r.table('datafiles').get(datafileid)
    rr = args.add_pluck_when_fields(rr)
    df = rr.run(g.conn, time_format='raw')
    access.check_access(user, df['owner'], df['id'])
    return args.json_as_format_arg(df)

@app.route('/v1.0/user/<user>/datafile/ids/<datadir_id>')
@apikey
@jsonp
def datafiles_list(user, datadir_id):
    list_of_datafiles = []
    ddir = r.table('datadirs').get(datadir_id).run(g.conn)
    for dfid in ddir['datafiles']:
        rr = r.table('datafiles').get(dfid)
        rr = args.add_pluck_when_fields(rr)
        df = rr.run(g.conn, time_format='raw')
        list_of_datafiles.append(df)
    return args.json_as_format_arg(list_of_datafiles)
