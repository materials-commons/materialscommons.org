#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser


def run(rql):
    try:
        return rql.run()
    except r.RqlRuntimeError:
        return None


def main(port, include_deleted):
    conn = r.connect('localhost', port, db='materialscommons')
    cursor = r.table('project2datadir') \
        .eq_join('datadir_id', r.table('datadirs')) \
        .merge({
        'right': {
            'name2': r.row['right']['name']
        }
    }).zip() \
        .eq_join('project_id', r.table('projects')).zip() \
        .run(conn)
    for doc in cursor:
        project_name = doc['name']
        dir_name = doc['name2']
        owner = doc['owner']
        if (owner == 'delete@materialscommons.org') and not include_deleted:
            continue
        if len(dir_name.split('/')) == 1:
            if not project_name == dir_name:
                print("Project '{}'({})".format(project_name, doc['project_id']))
                print(" -> dir '{}'({})".format(dir_name, doc['datadir_id']))
                print("    project owner = {}".format(owner))


if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int", help="rethinkdb port", default=30815)
    parser.add_option("-I", "--include-deleted", dest="incd", action="store_true", help="include deleted files", default=False)

    (options, args) = parser.parse_args()

    include_deleted = options.incd
    port = options.port
    print("Using database port = {}".format(port))

    if include_deleted:
        print("Including deleted files in search")
    else:
        print("Excluding deleted files from search")

    main(port, include_deleted)
