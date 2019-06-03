#!/usr/bin/env python

import rethinkdb as r


def get_files(d):
    return {files: r.table('datadir2datafile').get_all(d['datadir_id']).eq_join('datafile_id', r.table('datafiles')).zip().coerce_to('array')}


if __name__ == "__main__":
    conn = r.connect('localhost', 28015, db='materialscommons')
    files = r.table('project2datadir').get_all("7acf23a1-acc8-4cae-850a-2c74d1a04122"). \
        eq_join('datadir_id', r.table('datadirs')).zip(). \
        merge(get_files).run(conn)
