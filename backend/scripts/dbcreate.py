#!/usr/bin/env python
import rethinkdb as r
from os import environ

MCDB_PORT = environ.get('MCDB_PORT') or 28015
r.connect("localhost", int(MCDB_PORT), db="materialscommons").repl()


def create_database():
    run_rethinkdb_command(lambda: r.db_create("materialscommons").run())


def create_tables():
    run_rethinkdb_command(lambda: r.table_create("users").run())
    run_rethinkdb_command(lambda: r.table_create("usergroups").run())
    run_rethinkdb_command(lambda: r.table_create("datafiles").run())
    run_rethinkdb_command(lambda: r.table_create("dataparams").run())
    run_rethinkdb_command(lambda: r.table_create("datadirs").run())
    run_rethinkdb_command(lambda: r.table_create("tags").run())
    run_rethinkdb_command(lambda: r.table_create("news").run())
    run_rethinkdb_command(lambda: r.table_create("udqueue").run())
    run_rethinkdb_command(lambda: r.table_create("reviews").run())
    run_rethinkdb_command(lambda: r.table_create("conditions").run())
    run_rethinkdb_command(lambda: r.table_create("processes").run())
    run_rethinkdb_command(lambda: r.table_create("machines").run())
    run_rethinkdb_command(lambda: r.table_create("projects").run())
    run_rethinkdb_command(lambda: r.table_create("datasets").run())
    run_rethinkdb_command(lambda: r.table_create("citations").run())
    run_rethinkdb_command(lambda: r.table_create("notes").run())
    run_rethinkdb_command(lambda: r.table_create("templates").run())
    run_rethinkdb_command(lambda: r.table_create("state").run())
    run_rethinkdb_command(lambda: r.table_create("saver").run())
    run_rethinkdb_command(lambda: r.table_create("project2datadir").run())
    run_rethinkdb_command(lambda: r.table_create("project2datafile").run())
    run_rethinkdb_command(lambda: r.table_create("project2processes").run())
    run_rethinkdb_command(lambda: r.table_create("project2conditions").run())
    run_rethinkdb_command(lambda: r.table_create("review2datafile").run())


def create_indices():
    run_rethinkdb_command(lambda: r.table('datadirs').index_create('name').run())


def run_rethinkdb_command(func):
    try:
        func()
    except r.RqlRuntimeError:
        pass

if __name__ == "__main__":
    create_database()
    create_tables()
    create_indices()
