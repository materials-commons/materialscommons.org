#!/usr/bin/env bash

# travisrun.sh - to support travis tests of mcapi/python, the Python API
# initially a copy of dev.sh (and should probaly be maintained as that)

# Note: often this will be redundent, but it simplifies use
# source to set all environment variables for the type of server
export SERVERTYPE=travis

export MC_SERVICE_PORT=5002
export MC_API_SERVICE_PORT=5004
export MC_PUB_SERVICE_PORT=5026
export MCDB_PORT=30815
export MCDB_CONNECTION="localhost:$MCDB_PORT"
export MCDB_DIR=~/testdb
export RETHINKDB_HTTP_PORT=8090
export RETHINKDB_CLUSTER_PORT=31815
export MCSTOREDBIN=testbin/mcstored
export MC_ES_URL="http://localhost:9500"
export MC_ES_NAME="mc-es-test"
export MC_LOG_DIR=/tmp
if [ "$MCDB_FILE" = "" ]; then
    export MCDB_FILE=../test_data/rethinkdb_dump_test_data.tar.gz
fi
export MCDIR=~/mcdir/mcfs/data/test:/mcfs/data/materialscommons
export MCFS_HTTP_PORT=5012

if [ -f /etc/materialscommons/config.dev ]; then
    . /etc/materialscommons/config.dev
fi

if [ ! -d ${MCDB_DIR} ]; then
    mkdir -p ${MCDB_DIR}
fi

if [ "$REINIT" = "t" ]; then
    (cd ${MCDB_DIR}; rm -rf rethinkdb_data)
fi

export MCAPID_COMMAND="npx actionhero start --title=mcapi-${SERVERTYPE}"
export MCAPI_PORT=5028
export REDIS_PORT=5031
