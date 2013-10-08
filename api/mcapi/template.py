from mcapp import app
from decorators import crossdomain, apikey, jsonp
from flask import g, request
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
    template_table = {\
                      "process": create_process_template,\
                      "machine": create_machine_template
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
    template['model']['name'] = ""
    template['model']['owner'] = ""
    template['model']['description'] = ""
    template['model']['birthtime'] = ""
    template['model']['mtime'] = ""
    template['model']['machine'] = ""
    template['model']['process_type'] = ""
    template['model']['version'] = ""
    template['model']['parent'] = ""
    template['model']['notes'] = []
    template['model']['inputs'] = []
    template['model']['outputs'] = []
    template['model']['runs'] = []
    template['model']['citations'] = []
    template['model']['status'] = ""

def create_machine_template(j):
    template = common_template_elements("machine", j)
    template['model']['shortname'] = ""
    template['model']['longname'] = ""
    template['model']['birthtime'] = ""
    template['model']['contact'] = ""
    template['model']['notes'] = []

def common_template_elements(template_type, j):
    template = dict()
    template['template_type'] = template_type
    template['template_name'] = dmutil.get_required('name', j)
    template['template_owner'] = dmutil.get_required('owner', j)
    template['template_description'] = dmutil.get_required('template_description', j)
    now = r.now()
    template['template_birthtime'] = now
    template['template_mtime'] = now
    template['model'] = dict()
    return template
