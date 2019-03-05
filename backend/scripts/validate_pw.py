#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser
from pbkdf2 import crypt
import sys

if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-e", "--email", dest="email",
                      help="user email address", type="string")
    parser.add_option("-p", "--password", dest="password",
                      help="user password", type="string")
    parser.add_option("-P", "--port", dest="port", type="int",
                      help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()
    if options.email is None:
        print "You must specify an email"
        sys.exit(1)

    if options.password is None:
        print "You must specify a password"
        sys.exit(1)

    if options.port is None:
        options.port = 28015

    conn = r.connect('localhost', options.port, db='materialscommons')

    u = r.table('users').get(options.email).run(conn, time_format='raw')
    if u is None:
        print "No such user {}".format(options.email)
        sys.exit(1)
    dbpw = u['password']
    if dbpw == '':
        print "Database password is blank"
        sys.exit(1)
    _i1, _i2, _i3, salt, _pwhash = dbpw.split('$')
    hashedpw = crypt(options.password, salt, iterations=4000)
    if hashedpw == dbpw:
        sys.exit(0)

    sys.exit(1)
