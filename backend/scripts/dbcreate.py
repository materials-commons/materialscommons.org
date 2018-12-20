#!/usr/bin/env python
import rethinkdb as r
from os import environ

MCDB_PORT = environ.get('MCDB_PORT') or 28015
r.connect("localhost", int(MCDB_PORT)).repl()


def create_mc_database():
    run(r.db_create("materialscommons"))


def create_mc_tables():
    create_mc_table("users", "apikey", "admin", "validate_uuid")

    create_mc_table("account_requests", "validate_uuid")
    create_compound_index("account_requests", "id_validate", ["id", "validate_uuid"])

    create_mc_table("tags")
    create_mc_table("notes", "project_id")

    create_mc_table("properties", "item_id", "value")

    create_mc_table("projects", "name", "owner")
    create_compound_index("projects", "name_owner", ["name", "owner"])

    create_mc_table("templates", "owner")

    create_mc_table("samples", "project_id")
    create_mc_table('access', "user_id", "project_id")
    create_compound_index("access", "user_project", ["user_id", "project_id"])

    create_mc_table("events", "project_id", "birthtime")

    create_mc_table("datafiles", "name", "owner", "checksum", "usesid", "mediatype")
    run(r.db("materialscommons").table("datafiles")
        .index_create("mime", r.row["mediatype"]["mime"]))
    run(r.db('materialscommons').table("datafiles")
        .index_create('mediatype_description', r.row["mediatype"]["description"]))
    run(r.db('materialscommons').table("datafiles")
        .index_create('id_mediatype_description', [r.row['id'], r.row["mediatype"]["description"]]))

    create_mc_table("datadirs", "name", "project", "parent")
    create_compound_index("datadirs", "datadir_project_name", ['project', 'name'])
    create_compound_index("datadirs", "datadir_project_shortcut", ['project', 'shortcut'])

    create_mc_table("project2datadir", "datadir_id", "project_id")
    create_compound_index('project2datadir', 'project_datadir', ['project_id', 'datadir_id'])

    create_mc_table("project2datafile", "project_id", "datafile_id")
    create_compound_index('project2datafile', 'project_datafile', ['project_id', 'datafile_id'])

    create_mc_table("tag2item", "tag_id", "item_id")
    create_mc_table("comments", "owner", "item_id", "item_type")
    create_mc_table("note2item", "note_id", "item_id")

    create_mc_table("datadir2datafile", "datadir_id", "datafile_id")
    create_compound_index('datadir2datafile', 'datadir_datafile', ['datadir_id', 'datafile_id'])

    create_mc_table("uploads", "owner", "project_id")

    create_mc_table("background_process", "project_id", "queue", "status")
    create_compound_index("background_process", "user_project", ['user_id', 'project_id'])
    create_compound_index("background_process", "user_project_task", ['user_id', 'project_id', 'background_task_id'])

    create_mc_table("globus_auth_info", "owner")

    create_mc_table("globus_uploads", "project_id", "owner")

    create_mc_table("processes", "template_id", "birthtime")
    create_mc_table("project2process", "project_id", "process_id")
    create_compound_index("project2process", "project_process", ["project_id", "process_id"])

    create_mc_table("setups")

    create_mc_table("setupproperties", "setup_id")
    create_compound_index("setupproperties", "id_setup_id", ["id", "setup_id"])

    create_mc_table("process2setup", "process_id", "setup_id")
    create_mc_table("process2setupfile")
    create_mc_table("properties")
    create_mc_table("propertyset2property", "property_set_id", "property_id")
    create_mc_table("measurements", "process_id")
    create_mc_table("property2measurement", "property_id", "measurement_id")
    create_mc_table("process2measurement", "process_id", "measurement_id")

    create_mc_table("sample2propertyset", "sample_id", "property_set_id")
    create_compound_index("sample2propertyset", "sample_property_set", ["sample_id", "property_set_id"])

    create_mc_table("process2sample", "sample_id", "process_id", "property_set_id", "_type")
    create_compound_index("process2sample", "process_sample_property_set",
                          ["process_id", "sample_id", "property_set_id"])
    create_compound_index("process2sample", "process_sample", ["process_id", "sample_id"])
    create_compound_index("process2sample", "sample_property_set", ["sample_id", "property_set_id"])

    create_mc_table("project2sample", "sample_id", "project_id")
    create_compound_index("project2sample", "project_sample", ["project_id", "sample_id"])

    create_mc_table("best_measure_history", "process_id", "property_id", "measurement_id")

    create_mc_table("process2file", "process_id", "datafile_id", "_type")
    create_compound_index("process2file", "process_datafile", ["process_id", "datafile_id"])

    create_mc_table("propertysets", "parent_id")

    create_mc_table("sample2datafile", "sample_id", "datafile_id")
    create_compound_index("sample2datafile", "sample_file", ["sample_id", "datafile_id"])

    create_mc_table("measurement2datafile", "measurement_id", "datafile_id")

    create_mc_table("project2experiment", "project_id", "experiment_id")
    create_compound_index("project2experiment", "project_experiment", ["project_id", "experiment_id"])

    create_mc_table("experiments")

    create_mc_table("experiment2process", "experiment_id", "process_id")
    create_compound_index("experiment2process", "experiment_process", ["experiment_id", "process_id"])

    create_mc_table("experiment2sample", "experiment_id", "sample_id")
    create_compound_index("experiment2sample", "experiment_sample", ["experiment_id", "sample_id"])

    create_mc_table("experiment2datafile", "experiment_id", "datafile_id")
    create_compound_index("experiment2datafile", "experiment_datafile", ["experiment_id", "datafile_id"])

    create_mc_table("datasets", "owner")

    create_mc_table("experiment2dataset", "experiment_id", "dataset_id")
    create_compound_index("experiment2dataset", "experiment_dataset", ["experiment_id", "dataset_id"])

    create_mc_table("project2dataset", "project_id", "dataset_id")
    create_compound_index("project2dataset", "project_dataset", ["project_id", "dataset_id"])

    create_mc_table("dataset2sample", "dataset_id", "sample_id")
    create_compound_index("dataset2sample", "dataset_sample", ["dataset_id", "sample_id"])

    create_mc_table("dataset2process", "dataset_id", "process_id")
    create_compound_index("dataset2process", "dataset_process", ["dataset_id", "process_id"])

    create_mc_table("dataset2datafile", "dataset_id", "datafile_id")
    create_compound_index("dataset2datafile", "dataset_datafile", ["dataset_id", "datafile_id"])

    create_mc_table("deletedprocesses", "process_id", "sample_id", "project_id", "property_set_id")

    create_mc_table("experiment_etl_metadata", "experiment_id")

    create_mc_table("file_loads", "project_id")

    run(r.db('materialscommons').wait())


def create_mcpub_database():
    run(r.db_create('mcpub'))


def create_mcpub_tables():
    create_mcpub_table("appreciations", "user_id", "dataset_id")
    create_compound_index("appreciations", "user_dataset", ["user_id", "dataset_id"], db="mcpub")

    create_mcpub_table("users")
    create_mcpub_table("tags")

    create_mcpub_table("tag2dataset", "tag", "dataset_id")
    create_compound_index("tag2dataset", "tag_dataset", ["tag", "dataset_id"], db="mcpub")

    create_mcpub_table("view2item", "user_id", "item_id", "item_type")
    create_compound_index("view2item", "user_type", ["user_id", "item_type"], db='mcpub')
    create_compound_index("view2item", "user_item", ["user_id", "item_id"], db='mcpub')

    create_mcpub_table("useful2item", "user_id", "item_id", "item_type")
    create_compound_index("useful2item", "user_type", ["user_id", "item_type"], db='mcpub')
    create_compound_index("useful2item", "user_item", ["user_id", "item_id"], db='mcpub')

    create_mcpub_table("samples", "original_id")
    create_mcpub_table("datasets", "owner")
    create_mcpub_table("dataset2sample", "dataset_id", "sample_id")
    create_compound_index("dataset2sample", "dataset_sample", ["dataset_id", "sample_id"], db='mcpub')

    create_mcpub_table("dataset2process", "dataset_id", "process_id")
    create_compound_index("dataset2process", "dataset_process", ["dataset_id", "process_id"], db='mcpub')

    create_mcpub_table("dataset2datafile", "dataset_id", "datafile_id")
    create_compound_index("dataset2datafile", "dataset_datafile", ["dataset_id", "datafile_id"], db='mcpub')

    create_mcpub_table("datafiles", "name", "owner", "checksum", "usesid", "mediatype")
    run(r.db('mcpub').table("datafiles").index_create("mime", r.row["mediatype"]["mime"]))

    create_mcpub_table("processes", "template_id", "birthtime", "original_id")

    create_mcpub_table("setups", "original_id")

    create_mcpub_table("setupproperties", "setup_id")
    create_compound_index("setupproperties", "id_setup_id", ["id", "setup_id"], db='mcpub')

    create_mcpub_table("process2setup", "process_id", "setup_id")
    create_mcpub_table("process2setupfile")
    create_mcpub_table("properties")
    create_mcpub_table("propertyset2property", "property_set_id", "property_id")
    create_mcpub_table("measurements", "process_id")
    create_mcpub_table("property2measurement", "property_id", "measurement_id")
    create_mcpub_table("process2measurement", "process_id", "measurement_id")

    create_mcpub_table("sample2propertyset", "sample_id", "property_set_id")
    create_compound_index("sample2propertyset", "sample_property_set", ["sample_id", "property_set_id"], db='mcpub')

    create_mcpub_table("process2sample", "sample_id", "process_id", "property_set_id", "_type")
    create_compound_index("process2sample", "process_sample_property_set",
                          ["process_id", "sample_id", "property_set_id"], db='mcpub')
    create_compound_index("process2sample", "process_sample", ["process_id", "sample_id"], db='mcpub')

    create_mcpub_table("best_measure_history", "process_id", "property_id")

    create_mcpub_table("process2file", "process_id", "datafile_id", "_type")
    create_compound_index("process2file", "process_datafile", ["process_id", "datafile_id"], db='mcpub')

    create_mcpub_table("propertysets", "parent_id")

    create_mcpub_table("sample2datafile", "sample_id", "datafile_id")
    create_compound_index("sample2datafile", "sample_file", ["sample_id", "datafile_id"], db='mcpub')

    # run(r.db('mcpub').wait())


def create_mc_table(table, *args):
    run(r.db('materialscommons').table_create(table))
    run(r.db('materialscommons').table(table).wait())
    for index_name in args:
        create_index(table, index_name)
    run(r.db('materialscommons').table(table).index_wait())


def create_mcpub_table(table, *args):
    run(r.db('mcpub').table_create(table))
    run(r.db('mcpub').table(table).wait())
    for index_name in args:
        create_index(table, index_name, db='mcpub')
    run(r.db('mcpub').table(table).index_wait())


def create_index(table, name, db='materialscommons'):
    run(r.db(db).table(table).index_create(name))


def create_compound_index(table, name, index_fields, db='materialscommons'):
    fields = []
    for index_field_name in index_fields:
        fields.append(r.row[index_field_name])
    run(r.db(db).table(table).index_create(name, fields))
    run(r.db(db).table(table).index_wait())


def run(rql):
    try:
        rql.run()
    except r.RqlRuntimeError:
        pass


if __name__ == "__main__":
    create_mc_database()
    create_mc_tables()
    create_mcpub_database()
    create_mcpub_tables()
