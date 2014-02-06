#!/usr/bin/env python

import rethinkdb as r
import optparse


if __name__ == "__main__":
    parser = optparse.OptionParser()
    parser.add_option("-p", "--port", dest="port",
                      help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()
    conn = r.connect('localhost', int(options.port), db='materialscommons')

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
            if datafile is None:
                continue
            df = {}
            df['id'] = datafile['id']
            df['name'] = datafile['name']
            df['owner'] = datafile['owner']
            df['birthtime'] = datafile['birthtime']
            df['size'] = datafile['size']
            df['checksum'] = datafile['checksum']
            ddir['datafiles'].append(df)
        r.table('datadirs_denorm').insert(ddir).run(conn)
