#!/usr/bin/env python

import rethinkdb as r

conn = r.connect('localhost', 30815, db='materialscommons')
rql = r.table('datafiles').filter(r.row['usesid'].match("^[0-9a-f]")).pluck('size', 'name', 'datadirs')
total_bytes = 0
total_files = 0
for df in rql.run(conn):
    ddirId = df['datadirs'][0]
    ddir = r.table('datadirs').get(ddirId).run(conn)
    print "Duplicate %s/%s size %d" %(ddir['name'], df['name'], df['size'])
    total_bytes = total_bytes + df['size']
    total_files = total_files + 1

print "Total bytes = %s for %d dups" %(format(total_bytes, ",d"), total_files)
