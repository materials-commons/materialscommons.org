from mcapp import app
from decorators import jsonp, apikey
from flask import g
import rethinkdb as r
import error
import dmutil
import json
import args

@app.route('/templates/<template_id>', methods=['GET'])
@apikey
@jsonp
def get_template(template_id):
    return dmutil.get_single_from_table('templates', template_id)


@app.route('/templates/name/<template_name>', methods=['GET'])
@apikey
@jsonp
def get_template_by_name(template_name):
    items = list(r.table('templates')
                 .get_all(template_name, index='template_name')
                 .run(g.conn, time_format='raw'))
    if not items:
        return error.not_found("Template %s not found" % template_name)
    return json.dumps(items[0])


@app.route('/templates', methods=['GET'])
@apikey(shared=True)
@jsonp
def get_all_templates():
    rr = r.table('templates').order_by('template_name')
    selection = list(rr.run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)


@app.route('/templates/by_pick/<pick>', methods=['GET'])
@apikey(shared=True)
@jsonp
def get_templates_by_category(pick):
    rr = list(r.table('templates').get_all(pick, index='template_pick')
              .run(g.conn, time_format='raw'))
    return json.dumps(rr)
