#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser
import sys


class Access(object):
    def __init__(self, user_id, project_id, project_name):
        self.user_id = user_id
        self.project_id = project_id
        self.project_name = project_name
        self.dataset = ""
        self.permissions = ""
        self.status = ""
        self.birthtime = r.now()
        self.mtime = self.birthtime


def get_project(conn, project_id):
    return r.table('projects').get(project_id).run(conn)


def get_user(conn, user_id):
    return r.table('users').get(user_id).run(conn)


def list_all_projects(conn):
    projects = r.table('projects').merge(lambda proj: {'owner_details': r.table('users').get(proj['owner'])}).run(conn)
    for project in projects:
        if project['owner'] != 'delete@materialscommons.org' and project['owner_details']:
            print "%s: %s (%s/%s)" % (project['name'], project['id'], project['owner'], project['owner_details']['fullname'])


def list_users_projects(conn, user_id):
    user = get_user(conn, user_id)
    if user is None:
        print "Unknown user %s" % user_id
        sys.exit(1)

    projects = r.table('projects').get_all(user_id, index="owner").run(conn)
    if projects is None:
        print "User has no projects"
        return

    for project in projects:
        print "%s: %s" % (project['name'], project['id'])


def transfer_all_user_projects(conn, from_user, to_user):
    user_from = get_user(conn, from_user)
    if user_from is None:
        print "Unknown user %s" % from_user
        sys.exit(1)

    user_to = get_user(conn, to_user)
    if user_to is None:
        print "Unknown user %s" % to_user
        sys.exit(1)

    projects = r.table('projects').get_all(from_user, index="owner").run(conn)
    if projects is None:
        print "User has no projects"
        return

    for project in projects:
        print "Transfering project %s/%s to user %s" % (project['name'], project['id'], to_user)
        transfer_project_ownership(conn, project['id'], to_user)


def transfer_project_ownership(conn, project_id, to_user):
    if project_id is None:
        print "You must specify a project"
        sys.exit(1)

    if to_user is None:
        print "You must specify the user who is taking over the project"
        sys.exit(1)

    project = get_project(conn, project_id)
    if project is None:
        print "No such project %s" % project_id
        sys.exit(1)

    user = get_user(conn, to_user)
    if user is None:
        print "Unknown user %s" % to_user
        sys.exit(1)

    add_user_to_project(conn, project, user)
    set_project_owner(conn, project, user)
    transfer_experiment_ownership(conn, project, user)


def add_user_to_project(conn, project, user):
    access_entry = list(r.table('access').get_all([user['id'], project['id']], index="user_project").run(conn))
    if not access_entry:
        access_entry = Access(user['id'], project['id'], project['name'])
        r.table('access').insert(access_entry.__dict__).run(conn)


def set_project_owner(conn, project, user):
    r.table('projects').get(project['id']).update({'owner': user['id']}).run(conn)


def transfer_experiment_ownership(conn, project, user):
    p2e = r.table('project2experiment').get_all(project['id'], index="project_id").run(conn)
    for entry in p2e:
        experiment = r.table('experiments').get(entry['experiment_id']).run(conn)
        if experiment['owner'] == project['owner']:
            r.table('experiments').get(entry['experiment_id']).update({'owner': user['id']}).run(conn)


if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int", help="rethinkdb port", default=30815)
    parser.add_option("-a", "--all-projects", dest="all_projects", action="store_true", help="List all projects")
    parser.add_option("-p", "--project", dest="project_id", type="string", help="project id")
    parser.add_option("-t", "--to-user", dest="to_user", type="string", help="new project owner")
    parser.add_option("-f", "--from-user", dest="from_user", type="string", help="user to transfer projects from")
    parser.add_option("-l", "--list-projects-for", dest="list_for_user", type="string",
                      help="user to list projects for")
    parser.add_option("-u", "--user", dest="user_to_add", type="string", help="user to add to project")

    (options, args) = parser.parse_args()

    conn = r.connect('localhost', options.port, db='materialscommons')

    if options.all_projects:
        print "Listing all projects"
        list_all_projects(conn)
        sys.exit(0)

    if options.list_for_user:
        print "Listing user projects"
        list_users_projects(conn, options.list_for_user)
        sys.exit(0)

    if options.from_user and options.to_user:
        print "Transfering all projects from user %s to user %s" % (options.from_user, options.to_user)
        transfer_all_user_projects(conn, options.from_user, options.to_user)
        sys.exit(0)

    if options.project_id and options.to_user:
        print "Transfering project %s to user %s" % (options.project_id, options.to_user)
        transfer_project_ownership(conn, options.project_id, options.to_user)
        sys.exit(0)

    if options.user_to_add and options.project_id:
        print "Adding user to project"
        user = get_user(conn, options.user_to_add)
        project = get_project(conn, options.project_id)
        add_user_to_project(conn, project, user)
        sys.exit(0)

    print "No command specified"
