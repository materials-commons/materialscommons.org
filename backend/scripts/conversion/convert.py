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


def delete_unused_tables(conn):
    run_rql(r.table_drop("userprofiles"), conn)
    run_rql(r.table_drop("usergroups"), conn)
    run_rql(r.table_drop("runs"), conn)
    run_rql(r.table_drop("reviews"), conn)
    run_rql(r.table_drop("review2item"), conn)
    run_rql(r.table_drop("machines"), conn)
    run_rql(r.table_drop("ui"), conn)
    run_rql(r.table_drop("elements"), conn)
    run_rql(r.table_drop("sample2sample"), conn)
    run_rql(r.db('mcpub').table_drop("sample2sample"), conn)
    run_rql(r.table_drop("shares"), conn)
    run_rql(r.table_drop("user2share"), conn)


def main():
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int", help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()
    conn = r.connect('localhost', options.port, db="materialscommons")
    delete_unused_tables(conn)


if __name__ == "__main__":
    main()
