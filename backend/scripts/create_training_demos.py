#!/usr/bin/env python
import rethinkdb as r
import os

if __name__ == "__main__":
    conn = r.connect('localhost', 30815, db='materialscommons')
    apikeys = r.table('users').pluck('apikey', 'id').run(conn)
    for k in apikeys:
        command = "curl -XPUT http://mctest.localhost/api/v2/users/%s/create_demo_project?apikey=%s" % (
        k['id'], k['apikey'])
        print command
        os.system(command)
