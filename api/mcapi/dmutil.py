import json
from utils import error_response
import rethinkdb as r
from flask import g
from args import add_all_arg_options, json_as_format_arg, add_pluck_when_fields

def get_required(what, d):
    return d[what]

def get_optional(what, d, novalue=""):
    if what not in d:
        return novalue
    return d[what]

def insert_status(rv):
    if rv[u'inserted'] == 1:
        key = rv['generated_keys'][0]
        return json.dumps({'id': key})
    else:
        return error_response(400)

def get_all_from_table(table_name):
    rr = r.table(table_name)
    rr = add_all_arg_options(rr)
    items = list(rr.run(g.conn, time_format='raw'))
    return json_as_format_arg(items)

def get_single_from_table(table_name, item_id):
    rr = r.table(table_name).get(item_id)
    rr = add_pluck_when_fields(rr)
    item = rr.run(g.conn, time_format='raw')
    return json_as_format_arg(item)

def entry_exists(table_name, entry_id):
    rv = r.table(table_name).get(entry_id).run(g.conn)
    return rv is not None

def insert_entry(table_name, entry):
    rv = r.table(table_name).insert(entry).run(g.conn)
    return insert_status(rv)
