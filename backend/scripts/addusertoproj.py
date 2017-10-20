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


if __name__ == '__main__':

    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int",
                      help="rethinkdb port", default=30815)
    parser.add_option("-u", "--user", dest="user",
                      help="user id", type="string")
    parser.add_option("-p", "--project", dest="project", help="project id", type="string")
    (options, args) = parser.parse_args()

    conn = r.connect('localhost', options.port, db='materialscommons')
    if options.user is None:
        print "You must specify a user id"
        sys.exit(1)

    if options.project is None:
        print "You must specify a project"
        sys.exit(1)

    proj = r.table('projects').get(options.project).run(conn)
    if proj is None:
        print "No such project"
        sys.exit(1)

    a = Access(options.user, options.project, proj.name)
    r.table('access').insert(a.__dict__).run(conn)
    print "User added to project"
