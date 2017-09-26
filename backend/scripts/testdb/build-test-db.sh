#!/bin/bash -e
set -e

# no-output on pushd and popd
pushd () {
    command pushd "$@" > /dev/null
}

popd () {
    command popd "$@" > /dev/null
}

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
    exit 1
fi
echo "Rethingdb rebuild - using MCDB_PORT = $MCDB_PORT"

# build basic (e.g 'empty') DB; using standard script
pushd '../'
./dbcreate.py --port $MCDB_PORT
popd

# add test users
./makeUsersForTests.py --port $MCDB_PORT --password $MC_USERPW

# add templates
./loadtemplates.js

popd
echo "Done with Rethingdb rebuild."