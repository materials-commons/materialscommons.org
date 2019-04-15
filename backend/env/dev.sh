#!/usr/bin/env bash

# Note: often this will be redundant, but it simplifies use
# source to set all environment variables for the type of server
export SERVERTYPE=dev

export MC_API_SERVICE_PORT=5004
export MCSERV_PORT=5052
export MCDB_PORT=30815
export MCDB_CONNECTION="localhost:$MCDB_PORT"
export MCDB_DIR=~/devdb
export RETHINKDB_HTTP_PORT=8090
export RETHINKDB_CLUSTER_PORT=31815

export MCSTOREDBIN=testbin/mcstored
export MCSERVBIN=testbin/mcserv
export MCETLBIN=prodbin/mcetl

export MC_ES_URL="http://localhost:9500"
export MC_ES_NAME="mc-es-test"
export MC_LOG_DIR=/var/log/materialscommons/dev
if [ "$MCDB_FILE" = "" ]; then
    export MCDB_FILE=../test_data/rethinkdb_dump_test_data.tar.gz
fi
export MCDIR=~/mcdir/mcfs/data/test
export MCFS_HTTP_PORT=5012

if [ ! -d ${MCDB_DIR} ]; then
    mkdir -p ${MCDB_DIR}
fi

if [ "$REINIT" = "t" ]; then
    (cd ${MCDB_DIR}; rm -rf rethinkdb_data)
fi

export MCAPID_COMMAND="start.sh mcapid-${SERVERTYPE}"
export MCAPID_PORT=5016
export REDIS_PORT=5031

if [ -f /etc/materialscommons/config.dev ]; then
    . /etc/materialscommons/config.dev
fi

# see also the override file /etc/materialscommons/config.dev