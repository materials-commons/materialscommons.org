#!/bin/sh


PARAM="$1"

export DB_PORT=30815
export DB_CONNECTION="localhost:$DB_PORT"
export DB_FILE=/db_dumps/rethinkdb_dump_2016-04-20T13:30:11.tar.gz
export DB_HTTP_PORT=8090
export DB_CLUSTER_PORT=31815

export API_PORT=5000
export NODE_PATH=/src/backend

function startServers
{
   echo "Starting API Server"
   (cd src/backend; node --harmony app.js > /tmp/public.api.out 2>&1&)

   echo "Starting Rethinkdb"
   mkdir ~/publicdata
   (cd ~/publicdata; rethinkdb --driver-port $DB_PORT --cluster-port $DB_CLUSTER_PORT --http-port $DB_HTTP_PORT --daemon)
   disown -a
}


if [ $PARAM = "start" ]; then
    echo Starting Servers
    startServers
fi
