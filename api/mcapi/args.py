from flask import request
import json

def get_fields_arg():
    vals = request.args.get('fields')
    if vals is None:
        return vals
    else:
        return vals.split(',')

def add_pluck_when_fields(rr):
    fields = get_fields_arg()
    if fields:
        return rr.pluck(fields)
    else:
        return rr

def add_order_by_when_order_by(rr):
    val = request.args.get('order_by')
    if val:
        return rr.order_by(val)
    else:
        return rr

def add_all_arg_options(rr):
    rr = add_pluck_when_fields(rr)
    rr = add_order_by_when_order_by(rr)
    return rr

def json_as_format_arg(what):
    if 'format' in request.args:
        return json.dumps(what, indent=4)
    else:
        print what
        return json.dumps(what)
