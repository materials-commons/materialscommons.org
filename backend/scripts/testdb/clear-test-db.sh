#!/usr/bin/env bash

# pushd location of script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
pushd $DIR

# check that MCDB_PORT is available
if [ -z "$MCDB_PORT" ]; then
    echo "MCDB_PORT must be set to the RETHINKDB port number"
    echo "Setting MCDB_PORT to default value for tests: 30815"
    export MCDB_PORT=30815
fi
echo "using MCDB_PORT = $MCDB_PORT"

./deleteDatabases.py --port $MCDB_PORT