#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser
from pbkdf2 import crypt
import uuid
import sys


class User(object):
    def __init__(self, name, fullname, email, password, apikey, admin, tadmin):
        self.name = name
        self.email = email
        self.fullname = fullname
        self.password = password
        self.id = email
        self.apikey = apikey
        self.birthtime = r.now()
        self.mtime = self.birthtime
        self.avatar = ""
        self.description = ""
        self.affiliation = ""
        self.homepage = ""
        self.demo_installed = False
        self.last_login = r.now()
        self.notes = []
        self.admin = admin
        self.tadmin = tadmin
        self.preferences = {
            "tags": [],
            "templates": []
        }


def make_password_hash(password):
    salt = uuid.uuid1().hex
    return crypt(password, salt, iterations=4000)


def make_user(r, part_name, full_name, pw, key, admin, tadmin):
    pwhash = make_password_hash(pw)
    email = part_name + "@test.mc"
    apikey = key
    if (not apikey):
        apikey = uuid.uuid1().hex
    u = User(email, full_name, email, pwhash, apikey, admin, tadmin)
    r.table('users').insert(u.__dict__).run(conn)

    print("Addred user: " + email + " with password: " + pw + ", apikey: " + apikey\
        + ", admin: " + str(admin) + ", tadmin: " + str(tadmin))


if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-p", "--password", dest="password",
                      help="user password", type="string")
    parser.add_option("-P", "--port", dest="port", type="int",
                      help="rethinkdb port", default=30815)

    (options, args) = parser.parse_args()

    if options.password is None:
        print("You must specify a password")
        sys.exit(1)

    conn = r.connect('localhost', options.port, db='materialscommons')

    make_user(r, "admin", "Test Admin", options.password, None, True, False)
    make_user(r, "test", "Test User One", options.password, "totally-bogus", False, False)
    make_user(r, "another", "Test User Two", options.password, "another-bogus-account", False, False)
    make_user(r, "tadmin", "Test Template Admin", options.password, None, False, True)

