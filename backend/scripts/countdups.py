#!/usr/bin/env python

import rethinkdb as r

conn = r.connect('localhost', 30815, db='materialscommons')
rql = r.table('datafiles').filter(r.row['usesid'].match("^[0-9a-f]")).pluck('size')
total_bytes = 0
total_files = 0
for doc in rql.run(conn):
    total_bytes = total_bytes + doc['size']
    total_files = total_files + 1

print "Total bytes = %s for %d dups" %(format(total_bytes, ",d"), total_files)
