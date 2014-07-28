from mcapp import app
from decorators import jsonp, apikey
from flask import g
import rethinkdb as r
import error
import dmutil
import json


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

@app.route('/templates/input_output/<template_id>', methods=['GET'])
@apikey
@jsonp
def get_input_output_templates(template_id):
    template = r.table('templates').get(template_id).run(g.conn)
    inputs = template[u'required_input_conditions']
    outputs = template[u'required_output_conditions']
    templates = dict()
    input_template_ids = []
    output_template_ids = []
    if len(inputs) != 0:
        for i in inputs:
            input_template_ids.append(i[u'value'])
    if len(outputs) != 0:
        for o in outputs:
            output_template_ids.append(o[u'value'])
    if len(input_template_ids) != 0:
        templates['input_templates'] = list(r.table('templates').get_all(*input_template_ids).run(g.conn))
    if len(output_template_ids) != 0:
        templates['output_templates'] = list(r.table('templates').get_all(*output_template_ids).run(g.conn))
    return json.dumps(templates)



@app.route('/templates', methods=['GET'])
@apikey(shared=True)
@jsonp
def get_all_templates():
    return dmutil.get_all_from_table('templates')


@app.route('/templates/by_pick/<pick>', methods=['GET'])
@apikey(shared=True)
@jsonp
def get_templates_by_category(pick):
    rr = list(r.table('templates').get_all(pick, index='template_pick')
              .run(g.conn, time_format='raw'))
    return json.dumps(rr)
