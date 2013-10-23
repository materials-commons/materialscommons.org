#!/usr/bin/env python

import rethinkdb as r
import uuid
from pbkdf2 import crypt
import sys
from loader.model.user import User
from loader.model.usergroup import UserGroup
from loader.tasks.db import load_data_dirs, import_data_dirs_to_repo
from celery import chain

r.connect('localhost', 28015, db='materialscommons').repl()

def load_user_data(user, usergroup, dirpaths):
    setup_user(user, usergroup)
    chain(load_data_dirs.si(user, dirpaths) | import_data_dirs_to_repo.si(dirpaths))()

def setup_user(user, usergroup):
    create_user_if_needed(user)
    associate_user_with_usergroup(user, usergroup)

def create_user_if_needed(user):
    if r.table('users').get(user).run() is None:
        salt = uuid.uuid1().hex
        hash = crypt(salt[1:8], salt, iterations=4000)
        u = User(user, user, hash)
        r.table('users').insert(u.__dict__).run()

def associate_user_with_usergroup(user, usergroup):
    dbusergroup = create_usergroup_if_needed(user, usergroup)
    users = dbusergroup['users']
    if user not in users:
        users.append(user)
        r.table('usergroups').get(usergroup).update({'users':users}).run()

def create_usergroup_if_needed(user, usergroup):
    dbusergroup = r.table('usergroups').get(usergroup).run()
    if dbusergroup is None:
        ug = UserGroup(user, usergroup)
        rv = r.table('usergroups').insert(ug.__dict__, return_vals=True).run()
        dbusergroup = rv['new_val']
    return dbusergroup

def usage():
    print("metaloader user usergroup directories")
    sys.exit(1)

def main():
    if len(sys.argv) < 3:
        usage()
    else:
        load_user_data(user=sys.argv[1], usergroup=sys.argv[2], dirpaths=sys.argv[3:])

if __name__ == "__main__":
    main()
