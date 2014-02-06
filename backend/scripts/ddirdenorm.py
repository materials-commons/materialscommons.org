#!/usr/bin/env python

import rethinkdb as r

conn = r.connect('localhost', 30815, db='materialscommons')

if __name__ == "__main__":
    selection = list(r.table('datadirs').run(conn))
    for datadir in selection:
        print "Updating datadir %s" % (datadir['name'])
        ddir = {}
        ddir['id'] = datadir['id']
        ddir['name'] = datadir['name']
        ddir['owner'] = datadir['owner']
        ddir['birthtime'] = datadir['birthtime']
        ddir['datafiles'] = []
        for dfid in datadir['datafiles']:
            datafile = r.table('datafiles').get(dfid).run(conn)
            df = {}
            df['id'] = datafile['id']
            df['name'] = datafile['name']
            df['owner'] = datafile['owner']
            df['birthtime'] = datafile['birthtime']
            df['size'] = datafile['size']
            df['checksum'] = datafile['checksum']
            ddir['datafiles'].append(df)
        r.table('datadirs_denorm').insert(ddir).run(conn)
