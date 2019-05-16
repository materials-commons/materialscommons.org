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
    run_rql(r.table_drop("experimenttasks"), conn)
    run_rql(r.table_drop("experiment2experimenttask"), conn)
    run_rql(r.table_drop("experimenttask2process"), conn)
    run_rql(r.table_drop("experimentnotes"), conn)
    run_rql(r.table_drop("experiment2experimentnote"), conn)
    run_rql(r.table_drop("dataset2experimentnote"), conn)


def add_ptype_to_processes(conn):
    print "Adding ptype field to all processes..."
    processes = r.table('processes').run(conn)
    for process in processes:
        r.table('processes').get(process['id']).update({"ptype": process['template_name']}).run(conn)
    print "Done."


def main():
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int", help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()
    conn = r.connect('localhost', options.port, db="materialscommons")
    # delete_unused_tables(conn)
    add_ptype_to_processes(conn)


if __name__ == "__main__":
    main()
