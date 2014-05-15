#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser


def main(conn):
    dirs = list(r.table('datadirs').run(conn))
    for d in dirs:
        print "Updating datadir: %s" % (d['id'])
        r.table('datadirs').get(d['id'])\
                           .replace(
                               r.row.without(
                                   'access',
                                   'dataparams',
                                   'mytags',
                                   'reviews',
                                   'tags',
                                   'users'
                               )
                           ).run(conn)
        p2d = list(r.table('project2datadir')
                   .get_all(d['id'], index='datadir_id').run(conn))
        r.table('datadirs').get(d['id'])\
                           .update({'project': p2d[0]['project_id']})\
                           .run(conn)
    files = list(r.table('datafiles').run(conn))
    for f in files:
        print "Updating datafile: %s" % (f['id'])
        r.table('datafiles').get(f['id'])\
                            .replace(
                                r.row.without(
                                    'access',
                                    'conditions',
                                    'location',
                                    'machine',
                                    'marked_for_review',
                                    'metatags',
                                    'mytags',
                                    'process',
                                    'reviews',
                                    'tags',
                                    'text'
                                )
                            ).run(conn)
        r.table('datafiles').get(f['id']).update({'current': True}).run(conn)


if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int",
                      help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()

    conn = r.connect('localhost', options.port, db='materialscommons')
    main(conn)
