#!/usr/bin/env python
import rethinkdb as r
from os import environ

MCDB_PORT = environ.get('MCDB_PORT') or 28015
r.connect("localhost", int(MCDB_PORT), db="materialscommons").repl()


def create_database():
    run(r.db_create("materialscommons"))


def create_tables():
    run(r.table_create("users"))
    run(r.table_create("usergroups"))
    run(r.table_create("datafiles"))
    run(r.table_create("dataparams"))
    run(r.table_create("datadirs"))
    run(r.table_create("tags"))
    run(r.table_create("news"))
    run(r.table_create("udqueue"))
    run(r.table_create("reviews"))
    run(r.table_create("conditions"))
    run(r.table_create("processes"))
    run(r.table_create("machines"))
    run(r.table_create("projects"))
    run(r.table_create("datasets"))
    run(r.table_create("citations"))
    run(r.table_create("notes"))
    run(r.table_create("templates"))
    run(r.table_create("state"))
    run(r.table_create("saver"))
    run(r.table_create("project2datadir"))
    run(r.table_create("project2datafile"))
    run(r.table_create("project2processes"))
    run(r.table_create("project2conditions"))
    run(r.table_create("review2datafile"))


def create_indices():
    run(r.table('datadirs').index_create('name'))
    run(r.table('project2datadir').index_create('datadir_id'))
    run(r.table('project2datadir').index_create('project_id'))
    run(r.table('datafiles').index_create('name'))
    run(r.table('users').index_create('apikey'))
    run(r.table('projects').index_create('name'))
    run(r.table('projects').index_create('owner'))
    run(r.table('usergroups').index_create('owner'))


def run(rql):
    try:
        rql.run()
    except r.RqlRuntimeError:
        pass

if __name__ == "__main__":
    create_database()
    create_tables()
    create_indices()
