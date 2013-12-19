#!/usr/bin/env python

import hashlib
import os
import rethinkdb as r

def main():
    conn = r.connect('localhost', 28015, db='materialscommons')
    for root, dirs, files in os.walk("/home/gtarcea/mcfs/data/materialscommons"):
        for f in files:
            path = os.path.join(root, f)
            with open(path) as fd:
                data = fd.read()
                hash = hashlib.md5(data).hexdigest()
            s = os.stat(path).st_size
            r.table('datafiles').get(f).update({'size':s, 'checksum':hash}).run(conn)
            print "%s:%s:%d" %(path, hash, s)

if __name__ == "__main__":
    main()
