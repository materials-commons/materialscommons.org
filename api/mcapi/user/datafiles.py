from ..mcapp import app
from ..decorators import crossdomain, apikey, jsonp
from flask import g, request
import rethinkdb as r
import json
from ..utils import createTagCount, error_response, Status, set_dates
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

@app.route('/v1.0/user/<user>/condition/<ctype>', methods=['POST'])
@apikey
@crossdomain(origin='*')
def add_mc_conditions(user, ctype):
    if ctype == "material_condition":
        condition = create_material_condition(request.get_json(), user)
    elif ctype == "equipment_condition":
        condition = create_equipment_condition(request.get_json(), user)
    else:
        return error_response(400)
    if condition is None:
        return error_response(400)
    rv = r.table('conditions').insert(condition).run(g.conn)
    if (rv[u'inserted'] == 1):
        key = rv['generated_keys'][0]
        return json.dumps({'id': key})
    else:
        return error_response(400)

def create_material_condition(conditions, user):
    known_conditions_with_notes = ['alloy_name', 'known_composition', 'manufacturing_condition', 'heat_treatment']
    return create_condition(conditions, 'material_condition', known_conditions_with_notes, user)

def create_equipment_condition(conditions, user):
    if 'equipment_type' not in conditions:
        return None
    return create_condition_for_equipment(conditions, user)

def create_condition_for_equipment(conditions, user):
    equipment_type = conditions['equipment_type']
    if equipment_type == "TEM":
        known_conditions_with_notes = ['microscope_mfg', 'microscope_model', 'voltage', 'mode', 'field', 'specimen_prep', 'equipment_type']
    elif equipment_type == "APT":
        known_conditions_with_notes = ['microscope_mfg', 'microscope_model', 'microscope_type', 'temperature', 'pulse_frequency', 'specimen_prep', 'equipment_type']
    elif equipment_type == "SEM":
        known_conditions_with_notes = ['microscope_mfg', 'microscope_model', 'microscope_type', 'voltage', 'current', 'specimen_prep', 'equipment_type']
    return create_condition(conditions, "equipment_condition", known_conditions_with_notes, user)

def create_condition(conditions, ctype, known_conditions_with_notes, user):
    condition = dict()
    if 'name' not in conditions:
        return None
    condition['name'] = conditions['name']
    condition['properties'] = dict()
    condition['ctype'] = ctype
    condition['birthtime'] = r.now()
    condition['mtime'] = condition['birthtime']
    condition['owner'] = user
    properties = condition['properties']
    for condition_name in known_conditions_with_notes:
        if condition_name in conditions:
            properties[condition_name] = conditions[condition_name]
            note_name = condition_name + '_note'
            if note_name in conditions:
                properties[note_name] = conditions[note_name]
    return condition

@app.route('/v1.0/user/<user>/conditions/<ctype>')
@apikey
@jsonp
def get_all_material_conditions(user, ctype):
    rr = r.table('conditions').filter({'owner': user, 'ctype': ctype})
    rr = add_all_arg_options(rr)
    selection = list(rr.run(g.conn, time_format='raw'))
    return json_as_format_arg(selection)

@app.route('/v1.0/user/<user>/condition/<condition_id>')
@apikey
@jsonp
def get_condition_by_id(user, condition_id):
    rr = r.table('conditions').get(condition_id)
    rr = add_pluck_when_fields(rr)
    item = rr.run(g.conn, time_format='raw')
    if 'owner' not in item:
        return error_response(400)
    elif item['owner'] != user:
        return error_response(400)
    return json_as_format_arg(item)
