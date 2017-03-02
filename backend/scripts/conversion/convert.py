#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser
import sys


def msg(s):
    print s
    sys.stdout.flush()


def fix_missing_property_sets(conn):
    print "Fixing samples that having missing property sets..."
    process_property_sets = list(r.table('process2sample').run(conn))
    for p2s in process_property_sets:
        s2p = list(r.table('sample2propertyset').get_all(p2s['property_set_id'], index='property_set_id').run(conn))
        if not s2p:
            print "The following property set is missing %s" % (p2s['property_set_id'])
            r.table('sample2propertyset').insert({
                'current': True,
                'property_set_id': p2s['property_set_id'],
                'sample_id': p2s['sample_id'],
                'version': ''
            }).run(conn)
    print "Done."


def fix_file_upload_count_to_uploaded(conn):
    print "Add file uploaded with value from upload, removing upload..."
    r.table('datafiles').filter(r.row.has_fields('upload')) \
        .update({'uploaded': r.row['upload']}, durability="soft").run(conn)
    r.table('datafiles').filter(r.row.has_fields('upload')) \
        .replace(r.row.without('upload'), durability="soft").run(conn)
    print "Done."


def update_projects_with_new_fields(conn):
    print "Adding additional fields to projects. Swap notes and description..."
    r.table('projects').replace(r.row.without('note')).run(conn)
    projects = list(r.table('projects').run(conn))
    for p in projects:
        p['overview'] = p['description']
        p['description'] = ''
        p['status_notes'] = [
            {
                'note': '',
                'status': 'none'
            },
            {
                'note': '',
                'status': 'none'
            },
            {
                'note': '',
                'status': 'none'
            }
        ]
        p['status'] = 'none'
        p['tags'] = []
        r.table('projects').get(p['id']).update(p).run(conn)
    print "Done."


def main():
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int", help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()
    conn = r.connect('localhost', options.port, db="materialscommons")

    update_projects_with_new_fields(conn)
    fix_file_upload_count_to_uploaded(conn)


if __name__ == "__main__":
    main()
