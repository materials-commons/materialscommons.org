#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser


class DatabaseError(Exception):
    pass


def drop_table(table, conn):
    run(r.table_drop(table), conn)


def create_table(table, conn, *args):
    run(r.table_create(table), conn)
    for index_name in args:
        create_index(table, index_name, conn)


def create_index(table, name, conn):
    run(r.table(table).index_create(name), conn)


def run(rql, conn):
    try:
        rql.run(conn)
    except r.RqlRuntimeError:
        pass


def drop_tables(conn):
    print "Dropping old tables..."
    drop_table("processes", conn)
    drop_table("process2item", conn)
    drop_table("project2processes", conn)
    drop_table("projects2samples", conn)
    drop_table("sample2item", conn)
    drop_table("samples", conn)
    drop_table("properties", conn)
    drop_table("property_sets", conn)
    print "Done..."


def make_tables(conn):
    print "Creating tables..."
    create_table("processes", conn, "template_id")
    create_table("project2process", conn, "project_id", "process_id")
    create_table("samples", conn)
    create_table("sample2datafile", conn, "sample_id", "datafile_id")
    create_table("sample2attribute_set", conn, "sample_id",
                 "attribute_set_id")
    create_table("attribute_set2attribute", conn, "attribute_set_id",
                 "attribute_id")
    create_table("attribute_sets", conn, "parent_id")
    create_table("project2sample", conn, "sample_id", "project_id")
    create_table("process2sample", conn, "sample_id", "process_id",
                 "attribute_set_id", "_type")
    create_table("attribute2process", conn, "attribute_id",
                 "process_id")
    create_table("settings", conn)
    create_table("process2setting", conn, "process_id", "setting_id", "_type")
    create_table("process2file", conn, "process_id", "datafile_id", "_type")
    create_table("attributes", conn, "parent_id")
    create_table("measurements", conn, "process_id")
    create_table("attribute2measurement", conn, "attribute_id",
                 "measurement_id")
    create_table("best_measure_history", conn, "process_id", "attribute_id")
    print "Done..."


def main(port):
    conn = r.connect("localhost", port, db="materialscommons")
    drop_tables(conn)
    make_tables(conn)


if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int",
                      help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()
    main(options.port)
