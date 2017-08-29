#!/usr/bin/env bash

set -e

# abort if TEST_ACCOUNT_PW not set and non-empty
if [ -z "$MC_USERPW" ]; then
    echo "MC_USERPW must be set to a non-empty string"
    exit 1
fi

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

# build basic (e.g 'empty') DB; using standard script
pushd '../'
./dbcreate.py --port $MCDB_PORT
popd

# add test users
./makeUsersForTests.py --port $MCDB_PORT --password $MC_USERPW

# add templates
pushd '../templates/'
./run.sh
popd

popd
echo "Done."