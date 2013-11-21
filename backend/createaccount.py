#!/usr/bin/env python

import rethinkdb as r
import uuid
from pbkdf2 import crypt
import sys
from loader.model.user import User

r.connect('localhost', 28015, db='materialscommons').repl()

def create_user_if_needed(user, password):
    if r.table('users').get(user).run() is None:
        salt = uuid.uuid1().hex
        hash = crypt(password, salt, iterations=4000)
        u = User(user, user, hash)
        r.table('users').insert(u.__dict__).run()

def main():
    if len(sys.argv) < 2:
        usage()
    else:
        create_user_if_needed(user=sys.argv[1], password=sys.argv[2])

if __name__ == "__main__":
    main()
