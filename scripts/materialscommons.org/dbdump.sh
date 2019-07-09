#!/bin/sh
cd ~/dumps
DS=$(date +'%Y-%m-%d')
DUMPFILE=rethinkdb_dump-${DS}.tar.gz
rethinkdb dump -c localhost:28015 -f ${DUMPFILE}
cp ${DUMPFILE} /mcfs/gtarcea/dumps
