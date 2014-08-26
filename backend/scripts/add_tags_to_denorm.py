#!/usr/bin/env python
#
# This script adds tags to the datafiles table, datadirs table and datadirs denorm table
#

import rethinkdb as r
from optparse import OptionParser

def add_tags(conn):
    denorm_items = r.table('datadirs_denorm').run(conn)
    for item in denorm_items:
        files = []
        r.table('datadirs_denorm').get(item['id']).update({'tags': {}}).run(conn)
        files = item['datafiles']
        for file in files:
            file['tags'] = {}
        r.table('datadirs_denorm').get(item['id']).update({'datafiles': files}).run(conn)
    return ''
    
def main(conn):
    print "Beginning conversion steps:"
    add_tags(conn)
    print "Finished."


if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int",
                      help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()
    conn = r.connect('localhost', options.port, db='materialscommons')
    main(conn)
