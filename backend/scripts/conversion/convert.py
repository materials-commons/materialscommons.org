#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser
import sys


def msg(s):
    print s
    sys.stdout.flush()


def fix_users_table_type(conn):
    r.table('users').update({'otype': 'user'}).run(conn)
    r.table('users').filter(r.row.has_fields('_type')).replace(lambda doc: doc.without('_type')).run(conn)


def convert_scan_size(conn):
    print "Converting setup attribute scan_size to scan_size_width..."
    r.table('setupproperties').filter({'attribute': 'scan_size'}) \
        .update({
        'attribute': 'scan_size_width',
        'name': 'Scan Size Width'
    }).run(conn)
    print "Done."


def add_missing_description_field_to_processes(conn):
    print "Adding description field and removing notes field..."
    r.table('processes').update({'description': ''}).run(conn)
    all_processes = list(r.table('processes').run(conn))
    for p in all_processes:
        if 'note' in p:
            if p['note'] != '':
                r.table('processes').get(p['id']).update({'description': p['note']}).run(conn)
    r.table('processes').replace(r.row.without('note'))
    print "Done."


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
    print "Added file uploaded with value from upload, removing upload..."
    all_files = list(r.table('files').run(conn))
    for file in all_files:
        if 'upload' in file:
            p.table('files').get(file['id']).update({'uploaded': p['upload']}).run(conn)
    r.table('files').replace(r.row.without('upload')).run(conn)
    print "Done."

def main():
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int", help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()
    conn = r.connect('localhost', options.port, db="materialscommons")

    # Is this needed?
    # fix_users_table_type(conn)

    convert_scan_size(conn)
    add_missing_description_field_to_processes(conn)
    fix_missing_property_sets(conn)


if __name__ == "__main__":
    main()
