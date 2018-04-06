#!/usr/bin/env bash
set -e

# no-output on pushd and popd
pushd () {
    command pushd "$@" > /dev/null
}

popd () {
    command popd "$@" > /dev/null
}

set_locations() {
    # location of this script: backend/scripts/testdb
    DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    pushd $DIR
    BASE=`pwd`
    pushd '../..'
    SCRIPTS=`pwd`
    popd
    popd
}

# abort if $MC_USERPW not set and non-empty
if [ -z "$MC_USERPW" ]; then
    echo "MC_USERPW must be set to a non-empty string"
    exit 1
fi

# check that MCDB_PORT is available; else abort
if [ -z "$MCDB_PORT" ]; then
    echo "MCDB_PORT must be set to the RETHINKDB port number"
    exit 1
fi

echo "Rethinkdb rebuild - using MCDB_PORT = $MCDB_PORT (SERVERTYPE = ${SERVERTYPE})"

# NOTE: Assumptions = empty database, running on $MCDB_PORT

set_locations

# build basic (e.g 'empty') DB; using standard script
pushd ${SCRIPTS}/
./dbcreate.py --port $MCDB_PORT
popd

# add templates
pushd ${SCRIPTS}/templates
./run.sh
popd

# add test users
${BASE}/make-users-for-tests.py --port $MCDB_PORT --password $MC_USERPW


echo "Done with Rethinkdb rebuild."