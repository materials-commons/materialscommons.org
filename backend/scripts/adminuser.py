#!/usr/bin/env python
import rethinkdb as r
from optparse import OptionParser
import sys


def create_group(conn):
    group = {}
    group['name'] = "Admin Group"
    group['description'] = "Administration Group for Materials Commons"
    group['id'] = 'admin'
    group['owner'] = 'admin@materialscommons.org'
    group['users'] = []
    group['birthtime'] = r.now()
    group['mtime'] = r.now()
    r.table('usergroups').insert(group).run(conn)
    admin_group = r.table('usergroups').get('admin')\
                                       .run(conn, time_format='raw')
    return admin_group


def add_user(user, group, conn):
    for u in group['users']:
        if u == user:
            return
    group['users'].append(user)
    r.table('usergroups').get('admin').update(group).run(conn)

if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-P", "--port", type="int", dest="port",
                      help="rethinkdb port")
    parser.add_option("-u", "--user", type="string", dest="user",
                      help="user to add to admin group")
    (options, args) = parser.parse_args()

    if options.port is None:
        print "You must specify the rethinkdb port"
        sys.exit(1)

    if options.user is None:
        print "You must specify a user to add"
        sys.exit(1)

    conn = r.connect('localhost', options.port, db='materialscommons')
    admin_group = r.table('usergroups').get('admin')\
                                       .run(conn, time_format='raw')
    if admin_group is None:
        admin_group = create_group(conn)
    add_user(options.user, admin_group, conn)
