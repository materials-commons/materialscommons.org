#!/usr/bin/env python
#
# This script updates the mediatypes for new files.
#

import rethinkdb as r
from optparse import OptionParser
import os
import os.path
import magic


def datafile_path(mcdir, datafile_id):
    pieces = datafile_id.split("-")
    return os.path.join(mcdir, pieces[1][0:2], pieces[1][2:4], datafile_id)


def main(conn, mcdir):
    files = list(r.table('datafiles')
                 .get_all("", index='mediatype')
                 .run(conn))
    for f in files:
        fid = f['id']
        path = datafile_path(mcdir, fid)
        if not os.path.isfile(path):
            continue
        mediatype = magic.from_file(path, mime=True)
        for ddid in f['datadirs']:
            ddir = r.table('datadirs_denorm').get(ddid).run(conn)
            fsize = 0
            for df in ddir['datafiles']:
                if df['id'] == fid:
                    df['mediatype'] = mediatype
                    fsize = df['size']
                    break
            r.table('datadirs_denorm').get(ddid)\
                                      .update(ddir)\
                                      .run(conn)
            p2ds = list(r.table('project2datadir')
                        .get_all(ddid, index="datadir_id")
                        .run(conn))
            for p2d in p2ds:
                project_id = p2d['project_id']
                project = r.table('projects').get(project_id).run(conn)
                project['size'] += fsize
                if mediatype in project['mediatypes']:
                    project['mediatypes'][mediatype] += 1
                else:
                    project['mediatypes'][mediatype] = 1
                r.table('projects').get(project_id).update(project).run(conn)


if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int",
                      help="rethinkdb port", default=30815)
    parser.add_option("-d", "--directory", dest="mcdir", type="string",
                      help="mcdir location")
    (options, args) = parser.parse_args()
    if options.mcdir is None:
        print "You must specify the location of mcdir"
        os.exit(1)

    conn = r.connect('localhost', options.port, db='materialscommons')
    main(conn, options.mcdir)
