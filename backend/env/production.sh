#!/usr/bin/env bash

# Note: often this will be redundent, but it simplifies use
# source to set all environment variables for the type of server
export SERVERTYPE=production

export MC_DEPLOY_DIR=/var/www/html/materialscommons.org
export MCDB_PORT=28015
export MCDB_CONNECTION="localhost:$MCDB_PORT"
export MC_API_SERVICE_PORT=3006
export MC_PUB_SERVICE_PORT=5014
export MC_SERVICE_PORT=5006
export RETHINKDB_HTTP_PORT=8080
export RETHINKDB_CLUSTER_PORT=29015
export MCSTOREDBIN=${MC_DEPLOY_DIR}/bin/mcstored
export MCDB_DIR=/var/db/materialscommons/proddb
export MC_ES_URL="http://localhost:9200"
export MC_ES_NAME="mc-es"
export MC_LOG_DIR=/var/log/materialscommons/production

if [ $(hostname) = "materialscommons" ]; then
    export MCDIR=/mcfs/data/materialscommons
else
    export MCDIR=~/mcdir/mcfs/data/materialscommons:/mcfs/data/materialscommons
fi
export MCFS_HTTP_PORT=5010

if [ -f /etc/materialscommons/config.prod ]; then
    . /etc/materialscommons/config.prod
fi

export MCAPID_COMMAND="npx actionhero start cluster --workerTitlePrefix=mcapid-${SERVERTYPE}"
export MCAPID_PORT=5016
export REDIS_PORT=6379
