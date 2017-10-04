#!/usr/bin/env python
import rethinkdb as r
from os import environ

def clear_mc_tables():

    table_list = run(r.db('materialscommons').table_list())

    for table in table_list:
        if (not table == 'templates') and (not table == 'users'):
            clear_table("materialscommons",table)

    run(r.db('materialscommons').wait())

def clear_mcpub_tables():
    
    table_list = run(r.db('mcpub').table_list())

    for table in table_list:
        if not table == 'users':
            clear_table("mcpub",table)

    run(r.db('mcpub').wait())

def clear_table(db,table):
    run(r.db('db').table(table).delete())

def run(rql):
    try:
        return rql.run()
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