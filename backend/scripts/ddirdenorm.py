#!/usr/bin/env python

import rethinkdb as r
import optparse
import sys


def df_in(id, datafiles):
    for df in datafiles:
        if df['id'] == id:
            return True
    return False

if __name__ == "__main__":
    parser = optparse.OptionParser()
    parser.add_option("-P", "--port", dest="port",
                      help="rethinkdb port", default=30815)
    parser.add_option("-p", "--project", dest="project",
                      help="project to build denorm for")
    (options, args) = parser.parse_args()
    conn = r.connect('localhost', int(options.port), db='materialscommons')

    if options.project is None:
        print "You must specify a project id"
        sys.exit(1)

    rql = r.table('project2datadir')
    rql = rql.get_all(options.project, index="project_id")
    rql = rql.eq_join('datadir_id', r.table('datadirs')).zip()

    selection = list(rql.run(conn))
    for datadir in selection:
        print "Updating datadir %s" % (datadir['name'])
        ddir_denorm = r.table('datadirs_denorm').get(datadir['id']).run(conn)
        if ddir_denorm is None:
            ddir = {}
            ddir['id'] = datadir['id']
            ddir['name'] = datadir['name']
            ddir['owner'] = datadir['owner']
            ddir['birthtime'] = datadir['birthtime']
            ddir['datafiles'] = []
        else:
            ddir = ddir_denorm
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
            if df_in(df['id'], ddir['datafiles']):
                print "  Datafile id already in datadir - not adding"
                continue
            print "  Adding datafile id %s" % (df['id'])
            ddir['datafiles'].append(df)
        if ddir_denorm is None:
            print "Datadir %s does not exist creating" % (ddir['id'])
            r.table('datadirs_denorm').insert(ddir).run(conn)
        else:
            print "Datadir %s exists, updating" % (ddir['id'])
            r.table('datadirs_denorm').get(ddir['id']).update(ddir).run(conn)
