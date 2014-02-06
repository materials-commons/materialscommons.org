#!/usr/bin/env python

import json
import rethinkdb as r
import sys
import optparse


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
    parse.add_option("-p", "--port", dest="port", help="rethinkdb port", default=30815)
    parse.add_option("-f", "--file", dest="file", type="string", help="json file")
    (options, args) = parser.parse_args()
    conn = r.connect('localhost', int(options.port), db='materialscommons')
    json_data=open(options.file)
    #json_data=open(sys.argv[1])
    data = json.load(json_data)
    model = data["model"]
    template_name = data["template_name"]
    template_type = data["template_type"]
    template_description = data["template_description"]
    template_owner = data["owner"]
    template_pick = data["template_pick"]
    template_obj = Template(template_name, template_type, template_description, 
                            template_owner, model, template_pick)
    rr = r.table('templates').insert(template_obj.__dict__).run(conn)
    print rr

