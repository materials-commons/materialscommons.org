#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser
import sys
import os

def usesidRemap(x):
    r = e['datafile_id']
    if (e['usesid']):
        r = e['usesid']
    print r
    return r

if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-i", "--id", dest="id",
                      help="dataset id", type="string")
    parser.add_option("-P", "--port", dest="port", type="int",
                      help="rethinkdb port", default=30815)

    (options, args) = parser.parse_args()

    (options, args) = parser.parse_args()
    if options.id is None:
        print "You must specify a dataset id"
        sys.exit(1)

    conn = r.connect('localhost', options.port, db='materialscommons')

    dataset = r.table('datasets').get(options.id).run(conn)

    if dataset is None:
        print "No such dataset: " + options.id
        sys.exit(1)

    print "getting all files for the dataset with the name '" + dataset["title"] + "'"

    entries = r.table('dataset2datafile')\
        .eq_join('datafile_id',r.table("datafiles")).zip()\
        .filter({"dataset_id":options.id})\
        .pluck("usesid","datafile_id")\
        .run(conn)

    for e in entries:
        print e['datafile_id']
        if (e['usesid']):
            print "  ==>>" + e['usesid']

    print "-----------------------"

    mapping = map(None,entries)

    print "-----------------------"

    for x in mapping:
        print x