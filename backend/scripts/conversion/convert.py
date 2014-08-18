#!/usr/bin/env python
#
# This script converts the current production database to the new
# database layout.
#

import rethinkdb as r
from optparse import OptionParser


def convert_groups(conn):
    users = list(r.table('users').pluck('id').run(conn))
    projects = list(r.table('projects').run(conn, time_format='raw'))
    access_by_owner = {}
    #
    # For each project get the owner and build the
    # access list for that projects owners. Some
    # redundancy in code, but conversion is only
    # happening once, so not too worried about the
    # performance impact.
    for project in projects:
        owner = project['owner']
        if owner not in access_by_owner:
            print "  Determining access for projects owned by %s..." % (owner)
            access_by_owner[owner] = []
            groups = list(r.table('usergroups')
                          .filter({'owner': owner}).run(conn))
            for group in groups:
                for username in group['users']:
                    users = access_by_owner[owner]
                    if username not in users:
                        users.append(username)

    # Now that we have all the users go through the list
    # of projects and set up the access.
    for project in projects:
        owner = project['owner']
        print "  Setting access for project %s" % (project['name'])
        for user in access_by_owner[owner]:
            access = {
                "user_id": user,
                "project_id": project['id'],
                "project_name": project['name'],
                "dataset": "",
                "permissions": "",
                "birthtime": r.now(),
                "mtime": r.now()
            }
            r.table('access').insert(access).run(conn)

def add_preferences(conn):
    rr = r.table('users').update({'preferences': {'tags': [], 'templates': []}}).run(conn)

def main(conn):
    print "Beginning conversion steps:"
    convert_groups(conn)
    add_preferences(conn)
    print "Finished."

if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int",
                      help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()
    conn = r.connect('localhost', options.port, db='materialscommons')
    main(conn)
