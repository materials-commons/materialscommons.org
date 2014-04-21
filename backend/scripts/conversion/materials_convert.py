#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser


class Sample(object):
    def __init__(self):
        self.available = True
        self.birthtime = ""
        self.created_by = "admin@materialscommons.org"
        self.owner = "admin@materialscommons.org"
        self.description = ""
        self.name = ""
        self.notes = []
        self.properties = {}
        self.old_attributes = {}
        self.treatments = []


def new_property(name, ptype, value):
    p = {}
    p['name'] = name
    p['type'] = ptype
    p['value'] = value
    p['unit'] = ""
    return p


def main(conn):
    materials = list(r.table('materials').run(conn))
    for material in materials:
        if 'properties' in material:
            # new style schema
            continue

        # if we are here then we need to convert
        m = Sample()
        m.old_id = material['id']
        m.birthtime = material['birthtime']
        m.name = material['name']
        if 'alloy' in material:
            p = new_property("Composition", "text", material['alloy'])
            m.properties['composition'] = p
        elif 'alloy_name' in material:
            p = new_property("Composition", "text", material['alloy_name'])
            m.properties['composition'] = p
        else:
            print "%s: %s has no property we can use for composition, skipping..." % (m.old_id, m.name)
            continue
        if 'additional' in material:
            prop_to_use = 'additional'
        elif 'model' in material:
            prop_to_use = 'model'
        else:
            print "%s: %s doesn't have additional skipping..." % (m.id, m.name)
            continue
        for prop in material[prop_to_use]:
            if prop['name'] == "Supplier":
                p = new_property("Supplier", "text", prop['value'])
                m.properties['supplier'] = p
        if 'description' in material:
            m.description = material['description']
        else:
            m.description = ""
        m.created_by = 'admin@materialscommons.org'
        if 'additional' in material:
            m.old_attributes = material['additional']
        elif 'model' in material:
            m.old_attributes = material['model']
        print "Updating: %s" % (m.old_id)
        #r.table('materials').get(m.id).delete().run(conn)
        r.table('samples').insert(m.__dict__).run(conn)


if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int",
                      help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()

    conn = r.connect('localhost', options.port, db='materialscommons')
    main(conn)
