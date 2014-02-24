#!/usr/bin/env python

import rethinkdb as r
import optparse
import sys


def main():
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
        for df in datadir['datafiles']:
            print "Inserting datafile %s" % (df)
            p2df = {}
            p2df['project_id'] = options.project
            p2df['datafile_id'] = df
            r.table('project2datafile').insert(p2df).run(conn)

if __name__ == "__main__":
    main()
