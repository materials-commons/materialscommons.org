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
    run(r.table_create("drafts"))
    run(r.table_create("saver"))
    run(r.table_create("project2datadir"))
    run(r.table_create("project2datafile"))
    run(r.table_create("project2processes"))
    run(r.table_create("project2conditions"))
    run(r.table_create("review2datafile"))
    run(r.table_create("datadirs_denorm"))
    run(r.table_create("materials"))
    run(r.table_create("tag2item"))
    run(r.table_create("samples"))


def create_indices():
    run(r.table('datadirs').index_create('name'))
    run(r.table('project2datadir').index_create('datadir_id'))
    run(r.table('project2datadir').index_create('project_id'))
    run(r.table('datafiles').index_create('name'))
    run(r.table('datafiles').index_create('owner'))
    run(r.table('datafiles').index_create('checksum'))
    run(r.table('users').index_create('apikey'))
    run(r.table('projects').index_create('name'))
    run(r.table('projects').index_create('owner'))
    run(r.table('usergroups').index_create('owner'))
    run(r.table('usergroups').index_create('name'))
    run(r.table('templates').index_create('template_name'))
    run(r.table('drafts').index_create('owner'))
    run(r.table('drafts').index_create('project_id'))
    run(r.table('reviews').index_create('requested_to'))
    run(r.table('reviews').index_create('requested_by'))
    run(r.table('reviews').index_create('item_id'))
    run(r.table('project2datafile').index_create('project_id'))
    run(r.table('project2datafile').index_create('datafile_id'))
    run(r.table('tag2item').index_create('tag_id'))
    run(r.table('tag2item').index_create('item_id'))


def run(rql):
    try:
        rql.run()
    except r.RqlRuntimeError:
        pass

if __name__ == "__main__":
    create_database()
    create_tables()
    create_indices()
