#!/usr/bin/env python
import rethinkdb as r
from os import environ

MCDB_PORT = environ.get('MCDB_PORT') or 28015
r.connect("localhost", int(MCDB_PORT)).repl()


def create_database():
    run(r.db_create("materialscommons"))
    #run(r.db_create("history"))


def create_tables():
    create_table("users")
    create_table("usergroups")
    create_table("datafiles")
    create_table("datadirs")
    create_table("tags")
    create_table("news")
    create_table("udqueue")
    create_table("reviews")
    create_table("conditions")
    create_table("processes")
    create_table("machines")
    create_table("projects")
    create_table("datasets")
    create_table("citations")
    create_table("notes")
    create_table("templates")
    create_table("state")
    create_table("drafts")
    create_table("saver")
    create_table("project2datadir")
    create_table("project2datafile")
    create_table("project2processes")
    create_table("project2conditions")
    create_table("review2datafile")
    create_table("datadirs_denorm")
    create_table("tag2item")
    create_table("samples")
    create_table("treatments")


def create_table(table):
    run(r.db('materialscommons').table_create(table))
    #run(r.db('history').table_create(table))


def create_indices():
    create_index('datadirs', 'name')
    create_index('project2datadir', 'datadir_id')
    create_index('project2datadir', 'project_id')
    create_index('datafiles', 'name')
    create_index('datafiles', 'owner')
    create_index('datafiles', 'checksum')
    create_index('datafiles', 'usesid')
    create_index('users', 'apikey')
    create_index('projects', 'name')
    create_index('projects', 'owner')
    create_index('usergroups', 'owner')
    create_index('usergroups', 'name')
    create_index('templates', 'template_name')
    create_index('drafts', 'owner')
    create_index('drafts', 'project_id')
    create_index('reviews', 'requested_to')
    create_index('reviews', 'requested_by')
    create_index('reviews', 'item_id')
    create_index('project2datafile', 'project_id')
    create_index('project2datafile', 'datafile_id')
    create_index('tag2item', 'tag_id')
    create_index('tag2item', 'item_id')
    create_index('conditions', 'value')
    create_index('conditions', 'process_id')
    create_index('treatments', 'value')
    create_index('treatments', 'sample_id')
    create_index('templates', 'template_pick')


def create_index(table, name):
    #print "create_index(%s, %s)" % (table, name)
    run(r.db('materialscommons').table(table).index_create(name))
    #run(r.db('history').table(table).index_create(name))


def run(rql):
    try:
        rql.run()
    except r.RqlRuntimeError:
        pass

if __name__ == "__main__":
    create_database()
    create_tables()
    create_indices()
