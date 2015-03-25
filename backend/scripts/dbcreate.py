#!/usr/bin/env python
import rethinkdb as r
from os import environ

MCDB_PORT = environ.get('MCDB_PORT') or 28015
r.connect("localhost", int(MCDB_PORT)).repl()


def create_database():
    run(r.db_create("materialscommons"))


def create_tables():
    create_table("users", "apikey", "admin")
    create_table("usergroups", "owner", "name")
    create_table("tags")
    create_table("news")
    create_table("notes", "project_id")
    create_table("runs")
    create_table("properties", "item_id", "value")
    create_table("property_sets", "item_id")
    create_table("reviews", "assigned_to", "author", "project")
    create_table("processes", "project_id", "project")
    create_table("machines")
    create_table("projects", "name", "owner")
    create_table("templates")
    create_table("ui")
    create_table("drafts")
    create_table("samples", "project_id")
    create_table('access', "user_id", "project_id", "dataset")
    create_table("elements")
    create_table("events", "project_id")

    create_table("datafiles", "name", "owner",
                 "checksum", "usesid", "mediatype")
    run(r.db("materialscommons").table("datafiles")
        .index_create("mime", r.row["mediatype"]["mime"]))

    create_table("datadirs", "name", "project_id")
    create_table("project2datadir", "datadir_id", "project_id")
    create_table("project2datafile", "project_id", "datafile_id")
    create_table("tag2item", "tag_id", "item_id")
    create_table("comment2item", "comment_id", "item_id")
    create_table("note2item", "note_id", "item_id")
    create_table("review2item", "review_id", "item_id")
    create_table("process2item", "process_id", "item_id")
    create_table("sample2item", "sample_id", "item_id")
    create_table("datadir2datafile", "datadir_id", "datafile_id")
    create_table("uploads", "uploads", "project_id")

    create_samples_model()


def create_samples_model():
    pass


def create_table(table, *args):
    run(r.db('materialscommons').table_create(table))
    for index_name in args:
        create_index(table, index_name)


def create_index(table, name):
    run(r.db('materialscommons').table(table).index_create(name))


def create_indices():
    create_index('access', 'user_id')
    create_index('access', 'project_id')
    create_index('access', 'dataset')

    create_index('users', 'apikey')
    create_index('users', 'admin')

    create_index('projects', 'name')
    create_index('projects', 'owner')

    create_index('usergroups', 'owner')
    create_index('usergroups', 'name')

    create_index('templates', 'template_name')
    create_index('templates', 'template_pick')

    create_index('drafts', 'owner')
    create_index('drafts', 'project_id')

    create_index('reviews', 'assigned_to')
    create_index('reviews', 'author')
    create_index('reviews', 'project')

    create_index('processes', 'project_id')
    create_index('processes', 'project')  # Keep one of these

    create_index('samples', 'project_id')

    create_index('property_sets', 'item_id')

    create_index('properties', 'item_id')
    create_index('properties', 'value')

    create_index('notes', 'project_id')

    create_index('events', 'project_id')

    create_index('datadirs', 'name')
    create_index('datadirs', 'project')

    create_index('project2datadir', 'datadir_id')
    create_index('project2datadir', 'project_id')

    create_index('datafiles', 'name')
    create_index('datafiles', 'owner')
    create_index('datafiles', 'checksum')
    create_index('datafiles', 'usesid')
    create_index('datafiles', 'mediatype')

    create_index('project2datafile', 'project_id')
    create_index('project2datafile', 'datafile_id')

    run(r.db("materialscommons").table("datafiles")
        .index_create("mime", r.row["mediatype"]["mime"]))

    create_index('tag2item', 'tag_id')
    create_index('tag2item', 'item_id')

    create_index("comment2item", "comment_id")
    create_index("comment2item", "item_id")

    create_index("note2item", "note_id")
    create_index("note2item", "item_id")

    create_index("review2item", "review_id")
    create_index("review2item", "item_id")

    create_index("process2item", "process_id")
    create_index("process2item", "item_id")

    create_index('sample2item', 'sample_id')
    create_index('sample2item', 'item_id')

    create_index("datadir2datafile", "datadir_id")
    create_index("datadir2datafile", "datafile_id")

    create_index("uploads", "owner")
    create_index("uploads", "project_id")


def run(rql):
    try:
        rql.run()
    except r.RqlRuntimeError:
        pass

if __name__ == "__main__":
    create_database()
    create_tables()
    create_indices()
