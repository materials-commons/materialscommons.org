from ..mcapp import app
from ..decorators import crossdomain, apikey, jsonp
from flask import g, request
import rethinkdb as r
from ..utils import createTagCount, error_response, Status
from ..access import checkAccessResponseSingle, checkDatafileAccess
from ..args import add_all_arg_options, json_as_format_arg, add_pluck_when_fields

@app.route('/v1.0/user/<user>/datafiles')
@apikey
@jsonp
def datafiles_for_user(user):
    rr = r.table('datafiles').filter({'owner':user})
    rr = add_all_arg_options(rr)
    selection = list(rr.run(g.conn, time_format='raw'))
    return json_as_format_arg(selection)

@app.route('/v1.0/user/<user>/datafiles/tag/<tag>')
@apikey
@jsonp
def datafiles_for_user_by_tag(user, tag):
    rr = r.table('datafiles').filter({'owner':user}).filter(r.row['tags'].contains(tag))
    rr = add_all_arg_options(rr)
    selection = list(rr.run(g.conn, time_format='raw'))
    return json_as_format_arg(selection)

@app.route('/v1.0/user/<user>/datafile/update/<path:datafileid>', methods=['PUT'])
@apikey
@crossdomain(origin='*')
def update_datafile_for_user(user, datafileid):
    df = r.table('datafiles').get(datafileid).run(g.conn)
    status = checkDatafileAccess(user, df)
    if (status == Status.SUCCESS):
        rv = r.table('datafiles').get(datafileid).update(request.json).run(g.conn)
        if (rv['replaced'] == 1 or rv['unchanged'] == 1):
            return ''
        else:
            error_msg = error_response(status)
            return error_msg
    else:
        error_msg = error_response(status)
        return error_msg

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
    rr = add_pluck_when_fields(rr)
    df = rr.run(g.conn, time_format='raw')
    return checkAccessResponseSingle(user, df)

@app.route('/v1.0/user/<user>/datafile/ids/<datadir_id>')
@apikey
@jsonp
def datafiles_list(user, datadir_id):
    list_of_datafiles = []
    ddir = r.table('datadirs').get(datadir_id).run(g.conn)
    for dfid in ddir['datafiles']:
        rr = r.table('datafiles').get(dfid)
        rr = add_pluck_when_fields(rr)
        df = rr.run(g.conn, time_format='raw')
        list_of_datafiles.append(df)
    return json_as_format_arg(list_of_datafiles)

@app.route('/v1.0/user/<user>/material_conditions', methods=['POST'])
@apikey
@crossdomain(origin='*')
def add_mc_conditions(user):
    rv = r.table('material_conditions').insert(request.json).run(g.conn)
    if (rv[u'inserted'] == 1):
        return ''
    else:
        error_msg = error_response(400)
        return error_msg

@app.route('/v1.0/user/<user>/equipment_conditions', methods=['POST'])
@apikey
@crossdomain(origin='*')
def add_ec_conditions(user):
    rv = r.table('equipment_conditions').insert(request.json).run(g.conn)
    if (rv[u'inserted'] == 1):
        return ''
    else:
        error_msg = error_response(400)
        return error_msg

@app.route('/v1.0/user/<user>/material_conditions')
@apikey
@jsonp
def get_all_material_conditions(user):
    rr = r.table('material_conditions')
    rr = add_all_arg_options(rr)
    selection = list(rr.run(g.conn))
    return json_as_format_arg(selection)

@app.route('/v1.0/user/<user>/equipment_conditions')
@apikey
@jsonp
def get_all_equipment_conditions(user):
    rr = r.table('equipment_conditions')
    rr = add_all_arg_options(rr)
    selection = list(rr.run(g.conn))
    return json_as_format_arg(selection)
