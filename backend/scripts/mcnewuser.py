#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser
from pbkdf2 import crypt
import uuid
import sys


class User(object):
    def __init__(self, name, email, password):
        self.name = name
        self.email = email
        self.fullname = ""
        self.password = password
        self.id = email
        self.apikey = uuid.uuid1().hex
        self.birthtime = r.now()
        self.mtime = self.birthtime
        self.avatar = ""
        self.description = ""
        self.affiliation = ""
        self.homepage = ""
        self.notes = []


def make_password_hash(password):
    salt = uuid.uuid1().hex
    return crypt(password, salt, iterations=4000)


if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-e", "--email", dest="email",
                      help="user email address", type="string")
    parser.add_option("-p", "--password", dest="password",
                      help="user password", type="string")
    parser.add_option("-P", "--port", dest="port", type="int",
                      help="rethinkdb port", default=30815)
    parser.add_option("-u", "--update", dest="update",
                      default=False, action='store_true',
                      help="Reset users password")

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

    exists = r.table('users').get(options.email).run(conn)

    if options.update:
        pwhash = make_password_hash(options.password)
        if exists is None:
            print "No such user: " + options.email
        else:
            r.table('users').get(options.email)\
                            .update({'password': pwhash}).run(conn)
            print "Changed password for user: " + options.email
    elif exists is None:
        pwhash = make_password_hash(options.password)
        u = User(options.email, options.email, pwhash)
        r.table('users').insert(u.__dict__).run(conn)
        print "Add user: " + options.email
