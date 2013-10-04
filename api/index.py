#!/usr/bin/env python

import rethinkdb as r
import json
from pyelasticsearch import ElasticSearch

conn = r.connect('localhost', 28015)
es = ElasticSearch('http://localhost:9200/')

selection = list(r.table('tv_shows').run(conn))
print selection
val = r.table('tv_shows').run(conn)
val2 = r.table('tv_shows').get('d7c813e0-44e9-4816-a2dd-cb8348f453f3').coerce_to('object').run(conn)
#es.index("materialscommons", "data", val2, id=1)
print val2
print es.get("materialscommons", "data", 1)
#es.index("materialscommons", "data", val, id=1)
#json = json.dumps(selection[0])
#print json
#es.index("materialscommons", "data", "data:" + json, id=1)
#es.refresh('materialscommons')
#doc = es.get('materialscommons', 'data', 1)
#print doc
