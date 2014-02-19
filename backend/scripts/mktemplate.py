#!/usr/bin/env python

import json
import rethinkdb as r
import sys
import optparse
from ..mcapi import dmutil


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
    model = data["model"]
    template_name = data["template_name"]
    template_type = data["template_type"]
    template_description = data["template_description"]
    template_owner = data["owner"]
    template_pick = data["template_pick"]
    template_obj = Template(template_name, template_type, template_description, 
                            template_owner, model, template_pick)
    existing = dmutil.get_single_from_table('templates', template_obj.__dict__.id)
    if existing:
        r.table('templates').delete(existing.id).run(conn)
        rr = r.table('templates').insert(template_obj.__dict__).run(conn)
    else:
        rr = r.table('templates').insert(template_obj.__dict__).run(conn)
    print rr

