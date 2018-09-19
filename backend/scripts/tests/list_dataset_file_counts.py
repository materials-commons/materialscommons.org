#!/usr/bin/env python

import rethinkdb as r
import argparse
import tarfile
import sys
import os
from pathlib import Path

def usesidRemap(x):
    r = x['datafile_id']
    if (x['usesid']):
        r = x['usesid']
    return r

def makePath(x):
    s = x.split('-')[1]
    return s[:2] + "/" + s[2:] + "/" + x

def getOptions():
    parser = argparse.ArgumentParser(
                        description='List count of DB files and Dir files for all datasets')
    parser.add_argument("--base",dest="base", required=True,
                        help="the 'base' file system path of the directory for dataset files")
    parser.add_argument("--port", dest="port", type=int,
                    help="rethinkdb port", default=30815)
    args = parser.parse_args()
    return args

if __name__ == "__main__":

    args = getOptions()
    base_dir = args.base
    db_port = args.port

    conn = r.connect('localhost', db_port, db='materialscommons')

    if (base_dir[-1:] != "/"): base_dir = base_dir + "/"

    print("base is " + base_dir)

    datasets = list(r.table('datasets').run(conn))

    print("There are %d datasets" % len(datasets))

    if (len(datasets) is 0):
        print("No datasets")
        sys.exit(1)

    for dataset in datasets:

        dataset_id = dataset['id']

        entries = list(r.table('dataset2datafile')\
            .get_all(dataset_id, index='dataset_id')\
            .eq_join('datafile_id',r.table('datafiles'))
            .zip().pluck('usesid', 'datafile_id').run(conn))

        targets = map(usesidRemap,entries)

        paths = map(makePath, targets)

        db_count = len(paths)
        actual_count = 0

        for path in paths:
            full_path = base_dir + path
            possible_file = Path(full_path)
            if possible_file.is_file():
                actual_count += 1

        print ("for " + dataset_id + ": %d , %d - " + dataset["title"]) % (db_count, actual_count)
