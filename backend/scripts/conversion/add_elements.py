#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser


def main(conn):
    #read json file and iterate throught each element to build table rows
    

if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int",
                      help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()

    conn = r.connect('localhost', options.port, db='materialscommons')
    main(conn)
