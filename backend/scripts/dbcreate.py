#!/usr/bin/env python
import rethinkdb as r
from os import environ

MCDB_PORT = environ.get('MCDB_PORT') or 28015
r.connect("localhost", int(MCDB_PORT)).repl()


def create_database():
    run(r.db_create("materialscommons"))


def create_tables():
    create_table("users", "apikey", "admin")

    # User groups should go away once mcstored is updated
    create_table("usergroups", "owner", "name")

    create_table("tags")
    create_table("notes", "project_id")

    # Are runs, properties, and property_sets needed?
    create_table("runs")
    create_table("properties", "item_id", "value")

    create_table("reviews", "assigned_to", "author", "project_id")

    # Is machines needed?
    create_table("machines")

    create_table("projects", "name", "owner")
    create_table("templates")
    create_table("ui")

    create_table("samples", "project_id")
    create_table('access', "user_id", "project_id", "dataset")
    create_table("elements")
    create_table("events", "project_id")

    create_table("datafiles", "name", "owner",
                 "checksum", "usesid", "mediatype")
    run(r.db("materialscommons").table("datafiles")
        .index_create("mime", r.row["mediatype"]["mime"]))

    create_table("datadirs", "name", "project_id", "parent")

    create_table("project2datadir", "datadir_id", "project_id")
    create_compound_index('project2datadir', 'project_datadir', ['project_id', 'datadir_id'])

    create_table("project2datafile", "project_id", "datafile_id")
    create_compound_index('project2datafile', 'project_datafile', ['project_id', 'datafile_id'])

    create_table("tag2item", "tag_id", "item_id")
    create_table("comment2item", "comment_id", "item_id")
    create_table("note2item", "note_id", "item_id")
    create_table("review2item", "review_id", "item_id")

    create_table("datadir2datafile", "datadir_id", "datafile_id")
    create_compound_index('datadir2datafile', 'datadir_datafile',['datadir_id', 'datafile_id'])

    create_table("uploads", "uploads", "project_id")

    # Create samples model
    create_table("processes", "template_id")
    create_table("project2process", "project_id", "process_id")
    create_compound_index("project2process", "project_process", ["project_id", "process_id"])

    create_table("setups")

    create_table("setupproperties", "setup_id")
    create_compound_index("setupproperties", "id_setup_id", ["id", "setup_id"])

    create_table("process2setup", "process_id", "setup_id")
    create_table("process2setupfile")
    create_table("properties")
    create_table("propertyset2property", "property_set_id", "property_id")
    create_table("measurements", "process_id")
    create_table("property2measurement", "property_id", "measurement_id")
    create_table("process2measurement", "process_id", "measurement_id")

    create_table("sample2propertyset", "sample_id", "property_set_id")
    create_compound_index("sample2propertyset", "sample_property_set", ["sample_id", "property_set_id"])

    create_table("process2sample", "sample_id", "process_id", "property_set_id", "_type")
    create_compound_index("process2sample", "process_sample_property_set", ["process_id", "sample_id", "property_set_id"])
    create_compound_index("process2sample", "process_sample", ["process_id", "sample_id"])

    create_table("project2sample", "sample_id", "project_id")
    create_compound_index("project2sample", "project_sample", ["project_id", "sample_id"])

    create_table("best_measure_history", "process_id", "property_id")

    create_table("process2file", "process_id", "datafile_id", "_type")
    create_compound_index("process2file", "process_datafile", ["process_id", "datafile_id"])

    create_table("propertysets", "parent_id")

    create_table("sample2datafile", "sample_id", "datafile_id")
    create_compound_index("sample2datafile", "sample_file", ["sample_id", "datafile_id"])

    create_table("sample2sample", "parent_sample_id", "sample_id")

    create_table("shares", "project_id", "item_id", "item_type")
    create_table("user2share", "user_id", "share_id")
    create_compound_index('user2share', 'user_share', ["user_id", "share_id"])

    create_table("measurement2datafile", "measurement_id", "datafile_id")

    create_table("project2experiment", "project_id", "experiment_id")
    create_compound_index("project2experiment", "project_experiment", ["project_id", "experiment_id"])

    create_table("experiments")

    create_table("experiment2experimenttask", "experiment_id", "experiment_task_id")
    create_compound_index("experiment2experimenttask", "experiment_experiment_task",
                          ["experiment_id", "experiment_task_id"])

    create_table("experimenttasks", "parent_id")

    create_table("experimenttask2process", "experiment_task_id", "process_id")

    create_table("experiment2process", "experiment_id", "process_id")
    create_compound_index("experiment2process", "experiment_process", ["experiment_id", "process_id"])

    create_table("experiment2sample", "experiment_id", "sample_id")
    create_compound_index("experiment2sample", "experiment_sample", ["experiment_id", "sample_id"])

    create_table("experiment2datafile", "experiment_id", "datafile_id")
    create_compound_index("experiment2datafile", "experiment_datafile", ["experiment_id", "datafile_id"])

    create_table("experimentnotes")
    create_table("experiment2experimentnote", "experiment_id", "experiment_note_id")
    create_compound_index("experiment2experimentnote", "experiment_experiment_note", ["experiment_id", "experiment_note_id"])


def create_table(table, *args):
    run(r.db('materialscommons').table_create(table))
    for index_name in args:
        create_index(table, index_name)


def create_index(table, name):
    run(r.db('materialscommons').table(table).index_create(name))


def create_compound_index(table, name, index_fields):
    fields = []
    for index_field_name in index_fields:
        fields.append(r.row[index_field_name])
    run(r.db('materialscommons').table(table).index_create(name, fields))


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
