#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser
import sys

def msg(s):
    print s
    sys.stdout.flush()
    
    
def main(conn):
    denorm = list(r.table('samples_denorm').run(conn))
    for row in denorm:
        msg(" Adding row  %s" % (row['id']))
        r.table('processes2samples').insert(row).run(conn)
    msg("Done inserting rows into new table")
    

if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int",
                      help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()

    conn = r.connect('localhost', options.port, db='materialscommons')
    main(conn)
