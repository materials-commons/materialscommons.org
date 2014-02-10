from ..mcapp import app
from ..decorators import crossdomain, apikey, jsonp
from flask import g, request
import rethinkdb as r
from ..utils import create_tag_count
from .. import args
from .. import error
from .. import access
import os.path


@app.route('/datafiles')
@apikey(shared=True)
@jsonp
def datafiles_for_user():
    df_dg = {}
    user = access.get_user()
    rr = r.table('datafiles').filter({'owner': user})
    rr = args.add_all_arg_options(rr)
    selection = list(rr.run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)
    

@app.route('/datafiles/tag/<tag>')
@apikey(shared=True)
@jsonp
def datafiles_for_user_by_tag(tag):
    user = access.get_user()
    rr = r.table('datafiles').filter({'owner': user})\
                             .filter(r.row['tags'].contains(tag))
    rr = args.add_all_arg_options(rr)
    selection = list(rr.run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)


@app.route('/datafile/update/<path:datafileid>', methods=['PUT'])
@apikey
@crossdomain(origin='*')
def update_datafile_for_user(datafileid):
    user = access.get_user()
    df = r.table('datafiles').get(datafileid).run(g.conn)
    access.check(user, df['owner'], df['id'])
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
    selection = list(r.table('datafiles').get_all(user, index='owner')
                     .concat_map(lambda item: item['tags']).run(g.conn))
    return create_tag_count(selection)


@app.route('/datafile/<datafileid>')
@apikey(shared=True)
@jsonp
def datafile_for_user_by_id(datafileid):
    user = access.get_user()
    rr = r.table('datafiles').get(datafileid)
    rr = args.add_pluck_when_fields(rr)
    df = rr.run(g.conn, time_format='raw')
    access.check(user, df['owner'], df['id'])
    return args.json_as_format_arg(df)


@app.route('/datafile/ids/<datadir_id>')
@apikey(shared=True)
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


@app.route('/datafiles/<datadir_id>/<name>', methods=['GET'])
@apikey
@jsonp
def get_datafile_by_name(datadir_id, name):
    user = access.get_user()
    name = os.path.basename(name)
    rr = r.table('datafiles').filter({'name': name, 'owner': user})
    selection = list(rr.run(g.conn, time_format='raw'))
    if not selection:
        return error.not_found(
            "No such file %s in datadir %s" % (name, datadir_id))
    df = selection[0]
    for ddir_id in df['datadirs']:
        if ddir_id == datadir_id:
            return args.json_as_format_arg(df)
    return error.not_found(
        "No such file %s in datadir %s" % (name, datadir_id))

def find_match(row, df_id):
    if row['input_files'].contains(df_id):
        return True
    if row['output_files'].contains(df_id):
        return True
    else:
        return False

@app.route('/processes/datafile/<df_id>', methods=['GET'])
@jsonp
def get_processes(df_id):
    print df_id
    rr = r.table('processes').filter(
        lambda row: find_match(row, df_id)
        )
    selection = list(rr.run(g.conn, time_format='raw'))
    return  args.json_as_format_arg(selection)







