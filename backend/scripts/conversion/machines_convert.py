#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser


class Machine(object):
    def __init__(self):
        self.birthtime = ""
        self.created_by = ""
        self.description = ""
        self.name = ""
        self.notes = []
        self.properties = {}
        self.old_attributes = {}


def new_property(name, ptype, value):
    p = {}
    p['name'] = name
    p['type'] = ptype
    p['value'] = value
    p['unit'] = ""
    return p


def main(conn):
    machines = list(r.table('machines').run(conn))
    for machine in machines:
        if 'properties' in machine:
            # new style schema
            continue

        # if we are here then we need to convert
        m = Machine()
        m.id = machine['id']
        m.birthtime = machine['birthtime']
        m.name = machine['name']
        if 'description' in machine:
            m.description = machine['description']
        else:
            m.description = ""
        m.created_by = 'admin@materialscommons.org'
        if 'additional' in machine:
            prop_to_use = 'additional'
        elif 'model' in machine:
            prop_to_use = 'model'
        else:
            print "%s: %s doesn't have additional skipping..." % (m.id, m.name)
            continue
        for prop in machine[prop_to_use]:
            if prop['name'] == 'Manufacturer':
                p = new_property("Manufacturer", "text", prop['value'])
                m.properties['manufacturer'] = p
            elif prop['name'] == 'manufacturer':
                p = new_property("Manufacturer", "text", prop['value'])
                m.properties['manufacturer'] = p
            elif prop['name'] == 'Model':
                p = new_property("Model Number", "text", prop['value'])
                m.properties['model_number'] = p
            elif prop['name'] == 'Model#':
                p = new_property("Model Number", "text", prop['value'])
                m.properties['model_number'] = p
        if 'additional' in machine:
            m.old_attributes = machine['additional']
        elif 'model' in machine:
            m.old_attributes = machine['model']
        print "Updating: %s" % (m.id)
        r.table('machines').get(m.id).delete().run(conn)
        r.table('machines').insert(m.__dict__).run(conn)


if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int",
                      help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()

    conn = r.connect('localhost', options.port, db='materialscommons')
    main(conn)
