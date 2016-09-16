#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser
import sys
import os

def usesidRemap(x):
    r = x['datafile_id']
    if (x['usesid']):
        r = x['usesid']
    return r

def makePath(x):
    s = x.split('-')[1]
    return s[:2] + "/" + s[2:] + "/" + x

def getOptions():
    parser = OptionParser()
    parser.add_option("-i", "--id", dest="id",
                      help="dataset id", type="string")
    parser.add_option("-P", "--port",dest="port", type="int",
                      help="rethinkdb port", default=30815)
    parser.add_option("-B", "--base",dest="base", type='string');

    (options, args) = parser.parse_args()

    if options.id is None:
        print "You must specify a dataset id"
        sys.exit(1)

    if options.base is None:
        print "You must specify a base directory"
        sys.exit(1)

    return options


if __name__ == "__main__":

    options = getOptions()
    dataset_id = options.id
    base_dir = options.base
    db_port = options.port


    conn = r.connect('localhost', db_port, db='materialscommons')

    dataset = r.table('datasets').get(dataset_id).run(conn)

    if dataset is None:
        print "No such dataset: " + dataset_id
        sys.exit(1)

    print "getting all files for the dataset with the name '" + dataset["title"] + "'"

    entries = list(r.table('dataset2datafile')\
        .get_all(dataset_id, index='dataset_id')\
        .eq_join('datafile_id',r.table('datafiles'))
        .zip().pluck('usesid', 'datafile_id').run(conn))

    mapping = map(makePath,map(usesidRemap,entries))

    for x in mapping:
        print base_dir + "/" + x