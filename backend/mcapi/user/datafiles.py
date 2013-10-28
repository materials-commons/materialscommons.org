from ..mcapp import app
from ..decorators import crossdomain, apikey, jsonp, apigroup
from flask import g, request
import rethinkdb as r
from ..utils import create_tag_count
from .. import args 
from .. import error
from .. import access

@app.route('/datafiles')
@apikey
@apigroup
@jsonp
def datafiles_for_user():
    user = access.get_user()
    print "user = %s" % (user)
    rr = r.table('datafiles').filter({'owner':user})
    rr = args.add_all_arg_options(rr)
    selection = list(rr.run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)

@app.route('/datafiles/tag/<tag>')
@apikey
@apigroup
@jsonp
def datafiles_for_user_by_tag(tag):
    user = access.get_user()
    rr = r.table('datafiles').filter({'owner':user}).filter(r.row['tags'].contains(tag))
    rr = args.add_all_arg_options(rr)
    selection = list(rr.run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)

@app.route('/datafile/update/<path:datafileid>', methods=['PUT'])
@apikey
@crossdomain(origin='*')
def update_datafile_for_user(datafileid):
    user = access.get_user()
    df = r.table('datafiles').get(datafileid).run(g.conn)
    status = access.check(user, df['owner'], df['id'])
    rv = r.table('datafiles').get(datafileid).update(request.json).run(g.conn)
    if (rv['replaced'] == 1 or rv['unchanged'] == 1):
        return ''
    else:
        error.update_conflict("Unable to update datafile: " + datafileid)

@app.route('/tags/count')
@apikey
@jsonp
def tags_by_count_for_user():
    user = access.get_user()
    selection = list(r.table('datafiles').filter({'owner':user})\
                     .concat_map(lambda item: item['tags']).run(g.conn))
    return create_tag_count(selection)

@app.route('/datafile/<datafileid>')
@apikey
@apigroup
@jsonp
def datafile_for_user_by_id(datafileid):
    user = access.get_user()
    rr = r.table('datafiles').get(datafileid)
    rr = args.add_pluck_when_fields(rr)
    df = rr.run(g.conn, time_format='raw')
    access.check(user, df['owner'], df['id'])
    return args.json_as_format_arg(df)

@app.route('/datafile/ids/<datadir_id>')
@apikey
@apigroup
@jsonp
def datafiles_list(datadir_id):
    user = access.get_user()
    list_of_datafiles = []
    ddir = r.table('datadirs').get(datadir_id).run(g.conn)
    access.check(user, ddir['owner'], datadir_id)
    for dfid in ddir['datafiles']:
        rr = r.table('datafiles').get(dfid)
        rr = args.add_pluck_when_fields(rr)
        df = rr.run(g.conn, time_format='raw')
        list_of_datafiles.append(df)
    return args.json_as_format_arg(list_of_datafiles)
