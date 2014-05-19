#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser
import os


def datafile_dir(mcdir, datafile_id):
    pieces = datafile_id.split("-")
    return os.path.join(mcdir, pieces[1][0:2], pieces[1][2:4])


def main(conn, mcdir):
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
        fid = f['id']
        fpath = datafile_dir(mcdir, fid)
        try:
            uploaded = os.path.getsize(fpath)
        except:
            uploaded = 0
        r.table('datafiles').get(f['id']).update({'current': True,
                                                  'uploaded': uploaded})\
                                         .run(conn)


if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int",
                      help="rethinkdb port", default=30815)
    parser.add_option("-d", "--directory", dest="dir", type="string",
                      help="MCDIR location", default="/mcfs/data/test")
    (options, args) = parser.parse_args()

    conn = r.connect('localhost', options.port, db='materialscommons')
    main(conn, options.dir)
