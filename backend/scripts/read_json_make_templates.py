#!/usr/bin/env python

import json
from pprint import pprint
import rethinkdb as r
import sys

conn = r.connect("localhost", '30815', "materialscommons")

class Template:
    def __init__(self,template_name, template_type, template_description, template_owner, model, 
                      template_pick):
        self.template_type = template_type
        self.template_name = template_name
        self.template_pick = template_pick
        self.owner = template_owner
        self.template_description = template_description
        now = r.now()
        self.template_birthtime = now
        self.template_mtime = now
        self.model = model

json_data=open(sys.argv[1])
data = json.load(json_data)
model = data["model"]
template_name = data["template_name"]
template_type = data["template_type"]
template_description = data["template_description"]
template_owner = data["owner"]
template_pick = data["template_pick"]
template_obj = Template(template_name, template_type, template_description, template_owner, model,template_pick)
rr = r.table('templates').insert(template_obj.__dict__).run(conn)
print rr

