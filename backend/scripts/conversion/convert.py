#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser
import sys


def msg(s):
    print s
    sys.stdout.flush()


def run_rql(rql, conn):
    try:
        rql.run(conn)
    except r.RqlRuntimeError:
        pass


def add_todos_to_projects(conn):
    print "Adding todos entry to projects..."
    res = r.db('materialscommons').table('projects').update({"todos": []}).run(conn)
    print res
    print "Done."


def add_shortcut_to_dirs(conn):
    print "Adding shortcut flag to directories..."
    res = r.table('datadirs').update({"shortcut": False}).run(conn)
    print res
    print "Done."


def add_otype_to_dataset(conn):
    print "Adding otype to dataset..."
    res = r.table('datasets').update({'otype': 'dataset'}).run(conn)
    print res
    print "Done."


def main():
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int", help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()
    conn = r.connect('localhost', options.port, db="materialscommons")

    add_todos_to_projects(conn)
    add_shortcut_to_dirs(conn)
    add_otype_to_dataset(conn)


if __name__ == "__main__":
    main()
