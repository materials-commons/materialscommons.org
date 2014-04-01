#!/usr/bin/env python

import json
import rethinkdb as r
import sys
import optparse
import dmutil

class Template:
    def __init__(self,id, template_name, template_type, template_description, template_owner, model,
                      template_pick, required_input_conditions, required_output_conditions, required_input_files, required_output_files):
        self.id = id
        self.template_type = template_type
        self.template_name = template_name
        self.template_pick = template_pick
        self.owner = template_owner
        self.template_description = template_description
        now = r.now()
        self.template_birthtime = now
        self.template_mtime = now
        self.model = model
        self.required_input_files = required_input_files
        self.required_output_files = required_output_files
        self.required_input_conditions = required_input_conditions
        self.required_output_conditions = required_output_conditions

if __name__ == "__main__":
    parser = optparse.OptionParser()
    parser.add_option("-p", "--port", dest="port", help="rethinkdb port", default=30815)
    parser.add_option("-f", "--file", dest="filename",
                      help="json file", type="string")
    (options, args) = parser.parse_args()
    if options.filename is None:
        print "You must specify json file"
        sys.exit(1)
    conn = r.connect('localhost', int(options.port), db='materialscommons')
    json_data=open(options.filename)
    data = json.load(json_data)
    id = data["id"]
    model = data["model"]
    template_name = data["template_name"]
    template_type = data["template_type"]
    template_description = data["template_description"]
    template_owner = data["owner"]
    template_pick = data["template_pick"]
    required_input_conditions = dmutil.get_optional("required_input_conditions", data, [])
    required_output_conditions = dmutil.get_optional("required_output_conditions", data, [])
    required_input_files = dmutil.get_optional("required_input_files", data)
    required_output_files = dmutil.get_optional("required_output_files", data)
    template_obj = Template(id, template_name, template_type, template_description,
                            template_owner, model, template_pick, required_input_conditions, required_output_conditions, required_input_files, required_output_files)
    template_dict = template_obj.__dict__
    existing = r.table('templates').get(template_dict['id']).run(conn)
    if existing:
        print 'template deleted and re-inserted into the database'
        r.table('templates').get(template_dict['id']).delete().run(conn)
        rr = r.table('templates').insert(template_dict).run(conn)
    else:
        print 'template inserted into the database'
        rr = r.table('templates').insert(template_dict).run(conn)
    #print rr
