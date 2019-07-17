#!/bin/sh
cd /mcfs/dumps
DS=$(date +'%Y-%m-%d')
DUMPFILE=rethinkdb_dump-${DS}.tar.gz
rethinkdb dump -c localhost:28015 -f ${DUMPFILE}
