#!/usr/bin/env python
import rethinkdb as r

r.connect("localhost", 28015, db="materialscommons").repl()

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

def run_rethinkdb_command(func):
    try:
        func()
    except r.RqlRuntimeError:
        pass

if __name__ == "__main__":
    create_database()
    create_tables()
