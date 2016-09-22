#!/usr/bin/env python

import rethinkdb as r
import argparse
import sys
import os

def getOptions():
    parser = argparse.ArgumentParser(description='Add fullname values to user records in database')
    parser.add_argument("--file",  dest="filename", required=True,
                        help='The file with the tab-seperated table of e-mail, fullname')
    parser.add_argument("--dbname",dest="database", default='materialscommons',
                        help='the database to user for updates')
    parser.add_argument("--port", dest="port", type=int,
                        help="rethinkdb port", default=30815)
    args = parser.parse_args()
    return args

if __name__ == "__main__":
    args = getOptions()
    filename = args.filename
    database = args.database
    port = args.port

    conn = r.connect('localhost', port, db=database)

    users = r.table('users').run(conn)

    known_user_list = []
    known_user_name_dict = {}
    for user in users:
        email = user["id"]
        name = user["fullname"]
        known_user_list.append(email)
        if (name == email):
            name = ""
        known_user_name_dict[email] = name

    known_user_set = set(known_user_list)

    with open(filename) as f:
        lines = f.readlines()

    supplied_user_name_dict = {}
    for line in lines:
        line = line.rstrip('\n')
        if (line.strip() == ""): continue
        if (line.startswith("#")): continue
        parts = line.split("\t")
        if (len(parts) > 1):
            email = parts[0]
            name = parts[1]
            supplied_user_name_dict[email] = name

    for key in known_user_set:
        if (known_user_name_dict[key]):
            print "email, " + key + ", already has name: " + known_user_name_dict[key]

    print "----"

    for key in known_user_set:
        if (not known_user_name_dict[key]) and (not (key in supplied_user_name_dict)):
            print "email, " + key + ", has no name "

    print "----"

    for key in known_user_set:
        if (not known_user_name_dict[key]) and (key in supplied_user_name_dict):
            fullname = supplied_user_name_dict[key]
            r.db('materialscommons').table('users').get(key).update({"fullname":fullname}).run(conn)
            print "email, " + key + ", to be given the name: " + supplied_user_name_dict[key]

