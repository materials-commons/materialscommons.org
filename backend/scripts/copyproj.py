#!/usr/bin/env python

from optparse import OptionParser
import rethinkdb as r
import sys
import shutil
import os
import errno


def mkdirp(path):
    try:
        os.makedirs(path)
    except OSError as exc:
        if exc.errno == errno.EEXIST and os.path.isdir(path):
            pass
        else:
            raise


def file_dir(path, fid):
    pieces = fid.split("-")
    path = os.path.join(path, pieces[1][0:2], pieces[1][2:4])
    return path

if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int",
                      help="rethinkdb port", default=30815)
    parser.add_option("-p", "--project", dest="project", type="string",
                      help="project id to copy over")
    parser.add_option("-s", "--src", dest="src", type="string",
                      help="location of directory to copy from",
                      default="/mcfs/data/test")
    parser.add_option("-d", "--dest", dest="dest", type="string",
                      help="directory to copy to")
    (options, args) = parser.parse_args()
    if options.dest is None:
        print "You must specify a destination (--to) directory"
        sys.exit(1)
    if options.project is None:
        print "You must specify a project id to copy (--project)"
        sys.exit(1)

    conn = r.connect("localhost", options.port, db="materialscommons")

    rql = r.table("project2datadir")\
           .get_all(options.project, index="project_id")\
           .eq_join("datadir_id", r.table("datadir2datafile"),
                    index="datadir_id")\
           .zip()\
           .eq_join("datafile_id", r.table("datafiles"))\
           .zip()
    for fentry in rql.run(conn):
        if fentry['usesid'] != "":
            src_dir = file_dir(options.src, fentry['usesid'])
            dest_dir = file_dir(options.dest, fentry['usesid'])
            entry_id = fentry['usesid']
        else:
            src_dir = file_dir(options.src, fentry['id'])
            dest_dir = file_dir(options.dest, fentry['id'])
            entry_id = fentry['id']
        print "Copy %s from %s to %s" % (fentry['name'], src_dir, dest_dir)
        mkdirp(dest_dir)
        src_file_path = os.path.join(src_dir, entry_id)
        dest_file_path = os.path.join(dest_dir, entry_id)
        try:
            shutil.copy(src_file_path, dest_file_path)
        except:
            print "Problem copying file %s" % (fentry['name'])

        # Copy over conversion if it exists
        src_conv_path = os.path.join(src_dir, ".conversion", entry_id)
        if os.path.exists(src_conv_path):
            dest_conv_path = os.path.join(dest_dir, ".conversion", entry_id)
            try:
                shutil.copy(src_conv_path, dest_conv_path)
            except:
                print "Problem copying conversion file %s" % (fentry['name'])
