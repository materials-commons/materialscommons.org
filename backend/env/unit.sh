#!/usr/bin/env bash

# Note: often this will be redundent, but it simplifies use
# source to set all environment variables for the type of server
export SERVERTYPE=unit

export MC_SERVICE_PORT=5602
export MC_API_SERVICE_PORT=5604
export MC_PUB_SERVICE_PORT=5626
export MCDB_PORT=40815
export MCDB_CONNECTION="localhost:$MCDB_PORT"
export MCDB_DIR=~/unitdb
export RETHINKDB_HTTP_PORT=8070
export RETHINKDB_CLUSTER_PORT=41815
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
    mkdir ${MCDB_DIR}
fi

if [ "$REINIT" = "t" ]; then
    (cd ${MCDB_DIR}; rm -rf rethinkdb_data)
fi

export MCAPID_COMMAND="start.sh mcapid-${SERVERTYPE}"
export MCAPID_PORT=5628
export REDIS_PORT=5679
