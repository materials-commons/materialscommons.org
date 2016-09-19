#!/usr/bin/env python

import rethinkdb as r
# Note: "optparse is deprecated; you should use argparse in both python2 and python3"
# ref: http://stackoverflow.com/questions/4960880/understanding-optionparser
# link: http://docs.python.org/library/argparse.html#module-argparse
# rewiritten to comply - Fri Sep 16 07:54:54 EDT 2016
# from optparse import OptionParser
import argparse
import tarfile
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
    parser = argparse.ArgumentParser(description='Build Tar of files for a dataset.')
    parser.add_argument("--base",dest="base", required=True,
                        help="the 'base' file system path of the directory for dataset files")
    parser.add_argument("--id",  dest="id", required=True,
                    help='the database id of the dataset to use')
    parser.add_argument("--port", dest="port", type=int,
                    help="rethinkdb port", default=30815)
    args = parser.parse_args()
    return args

if __name__ == "__main__":

    args = getOptions()
    dataset_id = args.id
    base_dir = args.base
    db_port = args.port

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

    targets = map(usesidRemap,entries)

    paths = map(makePath, targets)

    arcbase="tarbase/"
    if (base_dir[-1:] != "/"): base_dir = base_dir + "/"
    print "base is " + base_dir

    tar = tarfile.open("sample.tar", "w")
    for path in paths:
        path_in = base_dir + path;
        path_out = arcbase + path;
        print "adding " + path_in + " as " + path_out
        tar.add(path_in,arcname=path_out)
    tar.close()

