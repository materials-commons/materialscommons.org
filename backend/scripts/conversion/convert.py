#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser
import sys


def msg(s):
    print s
    sys.stdout.flush()


def fix_mcpub_missing_property_types(conn):
    processes = list(r.db('mcpub').table('processes').filter(~r.row.has_fields('process_type')).run(conn))
    for process in processes:
        template = r.table('templates').get(process['template_id']).run(conn)
        r.db('mcpub').table('processes').get(process['id']).update({'process_type': template['process_type']}).run(conn)


def main():
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int", help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()
    conn = r.connect('localhost', options.port, db="materialscommons")

    fix_mcpub_missing_property_types(conn)


if __name__ == "__main__":
    main()
