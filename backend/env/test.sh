#!/usr/bin/env bash

# Note: often this will be redundent, but it simplifies use
# source to set all environment variables for the type of server
export SERVERTYPE=test

export MC_DEPLOY_DIR=/var/www/test/materialscommons.org
export MC_SERVICE_PORT=6002
export MC_API_SERVICE_PORT=6004
export MC_PUB_SERVICE_PORT=6026
export MC_API_GLOBUS_SERVICE_PORT=6046
export MC_ETL_SERVICE_PORT=6032
export MCDB_PORT=50815
export MCDB_CONNECTION="localhost:$MCDB_PORT"
export MCDB_DIR=/var/db/materialscommons/testdb
export RETHINKDB_HTTP_PORT=9090
export RETHINKDB_CLUSTER_PORT=51815
export MCSTOREDBIN=${MC_DEPLOY_DIR}/bin/mcstored
export MC_ES_URL="http://localhost:9800"
export MC_ES_NAME="mc-es-test"
export MC_LOG_DIR=/var/log/materialscommons/test
export MC_FAKTORY_DIR=/var/lib/materialscommons/faktory/test

if [ "$MCDB_FILE" = "" ]; then
    export MCDB_FILE=~/test_data/rethinkdb_dump_test_data.tar.gz
fi

export MCDIR=~/mcdir/mcfs/data/test:/mcfs/data/test:/mcfs/data/materialscommons
export MCFS_HTTP_PORT=6012

if [ -f /etc/materialscommons/config.test ]; then
    . /etc/materialscommons/config.test
fi

if [ ! -d ${MCDB_DIR} ]; then
    mkdir -p ${MCDB_DIR}
fi

if [ "$REINIT" = "t" ]; then
    (cd ${MCDB_DIR}; rm -rf rethinkdb_data)
fi

export MCAPID_COMMAND="npx actionhero start cluster --workerTitlePrefix=mcapid-${SERVERTYPE}"
export MCAPID_PORT=6028
export REDIS_PORT=7379

export MC_FAKTORY_PORT=7419
export MC_FAKTORY_NAME="mc-faktory-test"

export MC_API_URL="http://test.materialscommons.org/api"
export MC_GLOBUS_AUTH_CALLBACK="$MC_API_URL/etl/globus/auth/callback"

export MC_ETL_WORKER_LOG_LEVEL=INFO

# see also the override file /etc/materialscommons/config.test