#!/usr/bin/env python

import rethinkdb as r
import os

BASEDIR = "/home/gtarcea/mcdir/mcfs/users"

if __name__ == "__main__":
    conn = r.connect('localhost', 30815, db='materialscommons')
    entry = {
        "project_id": "a8d4b410-b6a6-4bc4-a8ec-c9dd52f9e1a9"
    }
    dbobj = r.table('globus_uploads').insert(entry, return_changes=True).run(conn)
    id = dbobj['changes'][0]['new_val']['id']
    os.makedirs(os.path.join(BASEDIR, "glenn.tarcea@gmail.com", id))
