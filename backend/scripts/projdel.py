#!/usr/bin/env python

import rethinkdb as r
import optparse
import sys


def delete_project(conn, project_id):
    project = r.table("projects").get(project_id).run(conn)
    if project is None:
        print "No such project: %s" % (project_id)
        sys.exit(1)
    print "Deleting project %s with id %s" % (project['name'], project_id)
    r.table("datadirs_denorm")\
     .get_all(project_id, index="project_id")\
     .delete().run(conn)
    dirs = list(r.table("datadirs")
                .get_all(project_id, index="project")
                .run(conn))
    for dir in dirs:
        files = dir['datafiles']
        if len(files) > 0:
            r.table("datafiles").get_all(*files).delete().run(conn)
    r.table("datadirs")\
     .get_all(project_id, index="project")\
     .delete()\
     .run(conn)
    r.table("projects").get(project_id).delete().run(conn)


def list_projects(conn):
    projects = list(r.table("projects").run(conn))
    for project in projects:
        print "%s: %s" % (project['name'], project['id'])


if __name__ == "__main__":
    parser = optparse.OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int",
                      help="rethinkdb port", default=30815)
    parser.add_option("-p", "--project", dest="project_id", type="string",
                      help="project id")
    parser.add_option("-l", "--list-projects", dest="list", default=False,
                      action="store_true", help="list projects")
    (options, args) = parser.parse_args()
    conn = r.connect("localhost", options.port, db="materialscommons")
    if options.list:
        list_projects(conn)
        sys.exit(0)

    if options.project_id is None:
        print "You must specify a project id to delete"
        sys.exit(1)
    delete_project(conn, options.project_id)
