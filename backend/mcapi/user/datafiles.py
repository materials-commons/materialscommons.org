from ..mcapp import app
from ..decorators import crossdomain, apikey, jsonp
from flask import g, request
import rethinkdb as r
from .. import args
from .. import error
from .. import access
import os.path


@app.route('/datafiles')
@apikey(shared=True)
@jsonp
def datafiles_for_user():
    user = access.get_user()
    rr = r.table('datafiles').filter({'owner': user})
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


@app.route('/datafile/<datafileid>')
@apikey(shared=True)
@jsonp
def datafile_for_user_by_id(datafileid):
    user = access.get_user()
    rr = r.table('datafiles').get(datafileid)
    rr = args.add_pluck_when_fields(rr)
    df = rr.run(g.conn, time_format='raw')
    access.check(user, df['owner'], df['id'])
    tags = list(r.table('items2tags')
                .get_all(datafileid, index='item_id')
                .filter({'user': user})
                .pluck('tag').run(g.conn))
    # Strip tag key
    df['tags'] = [t['tag'] for t in tags]
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


@app.route('/datafiles/<datafile_id>/reviews')
@apikey(shared=True)
@jsonp
def get_reviews_for_datafile(datafile_id):
    user = access.get_user()
    result = []
    df = r.table('datafiles').get(datafile_id).run(g.conn)
    if df is None:
        return error.not_found('No such datafile: %s' % (datafile_id))
    access.check(user, df['owner'])
    reviews = list(r.table('reviews')
                   .get_all(datafile_id, index='item_id').order_by('birthtime')
                   .run(g.conn, time_format='raw'))
    reviews =  r.table('reviews').run(g.conn, time_format='raw')
    for rev in reviews:
        for item in rev['items']:
            if item['item_id'] == datafile_id:
                result.append(rev)
    return args.json_as_format_arg(result)


@app.route('/processes/output/datafile/<df_id>', methods=['GET'])
@apikey
@jsonp
def get_output_process(df_id):
    rv = r.table('conditions').get_all(df_id, index='value')\
                              .filter({'step': 'output'})\
                              .eq_join('process_id',
                                       r.table('processes')).zip()
    selection = list(rv.run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)


@app.route('/processes/input/datafile/<df_id>', methods=['GET'])
@apikey
@jsonp
def get_input_processes(df_id):
    rv = r.table('conditions').get_all(df_id, index='value')\
                              .filter({'step': 'input'})\
                              .eq_join('process_id', r.table('processes'))\
                              .zip()
    selection = list(rv.run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)
