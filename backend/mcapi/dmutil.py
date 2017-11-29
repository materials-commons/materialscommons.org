import error
import rethinkdb as r
from flask import g
from args import add_all_arg_options, json_as_format_arg, add_pluck_when_fields
from mcexceptions import RequiredAttributeException, DatabaseError
import sys


def msg(s):
    print(s)
    sys.stdout.flush()


def get_required(what, d):
    if what not in d:
        msg("get_required not found: %s in %s" % (what, d))
        raise RequiredAttributeException(what)
    val = d[what]
    if val is None:
        msg("get_required attribute value %s is None in %s" % (what, d))
        raise RequiredAttributeException(what)
    return val


def get_optional(what, d, novalue=""):
    if what not in d:
        return novalue
    val = d[what]
    if val is None:
        return novalue
    return val


def get_optional_prop(what, d, novalue=""):
    for item in d:
        if what == item['name']:
            return item['value']
    return novalue


def get_required_prop(what, d):
    for item in d:
        if what == item['name']:
            return item['value']
    raise RequiredAttributeException(what)


def insert_status(rv, return_created=False):
    if rv[u'inserted'] == 1 or rv['replaced'] == 1:
        if return_created:
            if 'changes' in rv:
                val = rv['changes'][0]['new_val']
            else:
                val = rv['new_val']
        elif 'generated_keys' in rv:
            val = rv['generated_keys'][0]
        else:
            if 'changes' in rv:
                val = rv['changes'][0]['new_val']['id']
            else:
                val = rv['new_val']['id']
        return val
    else:
        raise DatabaseError()


def get_all_from_table(table_name, filter_by=None):
    rr = r.table(table_name)
    if filter_by:
        rr = rr.filter(filter_by)
    rr = add_all_arg_options(rr)
    items = list(rr.run(g.conn, time_format='raw'))
    return json_as_format_arg(items)


def get_single_from_table(table_name, item_id, raw=False):
    rr = r.table(table_name).get(item_id)
    rr = add_pluck_when_fields(rr)
    item = rr.run(g.conn, time_format='raw')
    if raw:
        return item
    elif not item:
        return error.bad_request(
            "Unknown id %s for table %s" % (item_id, table_name))
    else:
        return json_as_format_arg(item)


def entry_exists(table_name, entry_id):
    rv = r.table(table_name).get(entry_id).run(g.conn)
    return rv is not None


def insert_entry(table_name, entry, return_created=False):
    if g.rethinkdb_version > 113:
        rr = r.table(table_name).insert(entry, return_changes=True)
    else:
        rr = r.table(table_name).insert(entry, return_changes=True)
    rv = rr.run(g.conn, time_format='raw')
    return insert_status(rv, return_created=return_created)


def insert_entry_id(table_name, entry):
    if g.rethinkdb_version > 113:
        rr = r.table(table_name).insert(entry, return_changes=True)
    else:
        rr = r.table(table_name).insert(entry, return_changes=True)
    rv = rr.run(g.conn)
    if rv['inserted'] == 1:
        if 'generated_keys' in rv:
            return rv['generated_keys'][0]
        else:
            return rv['new_val']['id']
    raise DatabaseError()


def insert_join_entry(table_name, entry):
    rv = r.table(table_name).insert(entry).run(g.conn)
    if rv[u'inserted'] == 1:
        return True
    raise DatabaseError()


def item_exists(table, id):
    return r.table(table).get(id).run(g.conn)
