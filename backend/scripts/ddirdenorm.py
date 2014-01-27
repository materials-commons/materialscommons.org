#!/usr/bin/env python

import rethinkdb as r

conn = r.connect('localhost', 30815, db='materialscommons')

if __name__ == "__main__":
    for datadir in r.table('datadirs').run(conn):
        print "Update datadir %s" % (datadir['name'])
        datadir['datafileso'] = []
        for dfid in datadir['datafiles']:
            datafile = r.table('datafiles').get(dfid).run(conn)
            datadir['datafileso'].append(datafile)
        r.table('datadirs_denorm').insert(datadir).run(conn)
