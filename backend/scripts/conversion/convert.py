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


def add_missing_note_field_to_processes(conn):
    print "Adding note field to processes that are missing it..."
    r.table('processes').filter(~r.row.has_fields('note')).update({'note': ''}).run(conn)
    print "Done."


def main():
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int", help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()
    conn = r.connect('localhost', options.port, db="materialscommons")

    # Is this needed?
    # fix_users_table_type(conn)

    convert_scan_size(conn)
    add_missing_note_field_to_processes(conn)


if __name__ == "__main__":
    main()
