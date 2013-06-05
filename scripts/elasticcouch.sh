#!/bin/sh
curl -XPUT localhost:9200/_river/materialscommons/_meta -d '{
    "type" : "couchdb",
    "couchdb" : {
        "host" : "localhost",
        "port" : 5984,
        "db" : "materialscommons",
        "filter" : null
    },
    "index" : {
        "index" : "mcindex",
        "type" : "materialscommons",
        "bulk_size" : "100",
        "bulk_timeout" : "10ms"
    }
}'

