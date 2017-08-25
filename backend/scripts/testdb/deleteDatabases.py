#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser
from pbkdf2 import crypt
import uuid
import sys

if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-p", "--port", dest="port", type="int",
                      help="rethinkdb port", default=30815)

    (options, args) = parser.parse_args()

    conn = r.connect('localhost', options.port)

    dblist = r.db_list().run(conn)

    for db in dblist:
        if not db == "rethinkdb":
            ret = r.db_drop(db).run(conn)
            dropped = ret['dbs_dropped']
            if dropped:
                print "dropped: " + db

    print "done."