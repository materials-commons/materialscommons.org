from mcapp import app
from decorators import crossdomain, apikey, jsonp
from flask import request
import rethinkdb as r
from utils import error_response
import dmutil

@app.route('/v1.0/templates/<template_id>', methods=['GET'])
@jsonp
def get_template(template_id):
    return dmutil.get_single_from_table('templates', template_id)

@app.route('/v1.0/templates', methods=['GET'])
@jsonp
def get_all_templates():
    return dmutil.get_all_from_table('templates')

@app.route('/v1.0/templates/<template_id>', methods=['DELETE'])
@apikey
def delete_template(template_id):
    pass

@app.route('/v1.0/templates', methods=['POST'])
@apikey
@crossdomain(origin='*')
def create_template():
    j = request.get_json()
    template_type = dmutil.get_required('template_type', j)
    return create_template_for_type(template_type, j)

def create_template_for_type(template_type, j):
    print "create_template_for_type: %s" %(template_type)
    template_table = {\
                      "process": create_process_template,\
                      "machine": create_machine_template,\
                      "condition": create_condition_template\
    }
    if template_type in template_table:
        template_func = template_table[template_type]
        template = template_func(j)
        return dmutil.insert_entry('templates', template)
    else:
        # Do something about throwing an error
        return error_response(400)

def create_process_template(j):
    template = common_template_elements("process", j)
    required_conditions = dmutil.get_optional('required_conditions', j, [])
    add_model_item(template, 'required_conditions', required_conditions)
    add_model_item(template, 'name', "")
    add_model_item(template, 'owner', "")
    add_model_item(template, 'description', "")
    add_model_item(template, 'birthtime', "")
    add_model_item(template, 'mtime', "")
    add_model_item(template, 'machine', "")
    add_model_item(template, 'process_type', "")
    add_model_item(template, 'version', "")
    add_model_item(template, 'parent', "")
    add_model_item(template, 'notes', [])
    add_model_item(template, 'inputs', [])
    add_model_item(template, 'outputs', [])
    add_model_item(template, 'runs', [])
    add_model_item(template, 'citations', [])
    add_model_item(template, 'status', "")
    return template

def create_machine_template(j):
    template = common_template_elements("machine", j)
    add_model_item(template, 'shortname', "")
    add_model_item(template, 'longname', "")
    add_model_item(template, 'birthtime', "")
    add_model_item(template, 'contact', "")
    add_model_item(template, 'description', "")
    add_model_item(template, 'notes', [])
    return template

def create_condition_template(j):
    template = common_template_elements("condition", j)
    properties = j['properties']
    for prop in properties:
        prop_name = prop['name']
        prop_value = prop['value']
        add_model_item(template, prop_name, prop_value)
        add_model_item(template, prop_name + '_note', "")
    return template

def common_template_elements(template_type, j):
    template = dict()
    template['template_type'] = template_type
    template['template_name'] = dmutil.get_required('template_name', j)
    template['owner'] = dmutil.get_required('owner', j)
    template['template_description'] = dmutil.get_required('template_description', j)
    now = r.now()
    template['template_birthtime'] = now
    template['template_mtime'] = now
    template['model'] = list()
    return template

def add_model_item(template, name, value):
    template['model'].append({'name':name, 'value':value})
