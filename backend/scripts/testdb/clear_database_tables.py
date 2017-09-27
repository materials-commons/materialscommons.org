#!/usr/bin/env python
import rethinkdb as r
from os import environ

def clear_mc_tables():

    table_list = ["account_requests", "userprofiles", "usergroups", "tags", "notes",
                  "runs", "properties", "reviews", "machines", "projects", "ui", "samples",
                  "access", "elements", "events", "datafiles", "datadirs", "project2datadir",
                  "project2datafile", "tag2item", "comment2item", "note2item", "review2item",
                  "datadir2datafile", "uploads", "processes", "project2process", "setups",
                  "setupproperties", "process2setup", "process2setupfile", "properties",
                  "propertyset2property", "measurements", "property2measurement",
                  "process2measurement", "sample2propertyset", "process2sample", "project2sample", 
                  "best_measure_history", "process2file", "propertysets", "sample2datafile",
                  "sample2sample", "shares", "user2share", "measurement2datafile",
                  "project2experiment", "experiments", "experiment2experimenttask", 
                  "experimenttasks", "experimenttask2process", "experiment2process",
                  "experiment2sample", "experiment2datafile", "experimentnotes", 
                  "experiment2experimentnote", "datasets", "experiment2dataset", "dataset2sample",
                  "dataset2process", "dataset2datafile", "dataset2experimentnote"]

    for table in table_list:
        clear_table("materialscommons",table)

    run(r.db('materialscommons').wait())

def clear_mcpub_tables():
    
    table_list = ["appreciations", "tags", "tag2dataset", "comments", "views", "samples", "datasets",
                  "dataset2sample", "dataset2process", "dataset2datafile", "dataset2experimentnote",
                  "datafiles", "processes", "setups", "setupproperties", "process2setup",
                  "process2setupfile", "properties", "propertyset2property", "measurements",
                  "property2measurement", "process2measurement", "sample2propertyset",
                  "process2sample", "best_measure_history", "process2file", "propertysets",
                  "sample2datafile", "sample2sample"]

    for table in table_list:
        clear_table("mcpub",table)

    run(r.db('mcpub').wait())

def clear_table(db,table):
    run(r.db('db').table(table).delete())

def run(rql):
    try:
        rql.run()
    except r.RqlRuntimeError:
        pass

if __name__ == "__main__":

    MCDB_PORT = environ.get('MCDB_PORT')
    print("Clearing all tables in materialscommons and mcpub; except for the following:")
    print("  materialscommons.users, mcpub.users, and materialscommons.templates.")
    if not MCDB_PORT:
        print("This script requires that MCDB_PORT be set - and it is not; exiting.")
        exit(-1)

    print("  Clear materialscommons and mcpub databases on port = " + MCDB_PORT + "...")

    r.connect("localhost", int(MCDB_PORT)).repl()

    clear_mc_tables()
    clear_mcpub_tables()

    print("Done clearing tables in materialscommons and mcpub.")