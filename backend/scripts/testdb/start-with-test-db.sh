#!/usr/bin/env bash

# no-output on pushd and popd
pushd () {
    command pushd "$@" > /dev/null
}

popd () {
    command popd "$@" > /dev/null
}

set_env() {
    export MCDB_PORT=30815
    export RETHINKDB_HTTP_PORT=8090
    export RETHINKDB_CLUSTER_PORT=31815
}

print_message() {
    cat <<- EOF
This script will start the Materials Commons test environment with
a useful, empty, test database. No projects, Experiments or other
data is defined. See the content of the script for details.
There are 4 users defined: test@test.mc, another@test.mc, admin@test.mc,
and tadmin@test.mc. For each user the password is set to 'test' and
specific apikeys are set for the users 'test' and 'another'. The user
'admin' is defined as an admin, and the user 'tadmin' is defined as a
template admin. See makeUserForTest.py for details on users.
EOF
}

set_locations() {
    # location of this script, scripts, backend
    DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    pushd $DIR
    BASE=`pwd`
    pushd '..'
    SCRIPTS=`pwd`
    pushd '..'
    BACKEND=`pwd`
    popd
    popd
    popd
}

print_env_and_locations() {
    echo "----------- Test DB rebuild ENV settings --------------"
    echo "  BASE - the location of this script and other helper scripts"
    echo "  BASE      ${BASE} "
    echo "  SCRIPTS - the location of the materialscommons.org/backend/scripts folder"
    echo "  SCRIPTS   ${SCRIPTS} "
    echo "  BACKEND - the location of the materialscommons.org/backend folder"
    echo "  BACKEND   ${BACKEND} "
    echo "  MCDB_PORT               ${MCDB_PORT} "
    echo "  RETHINKDB_HTTP_PORT     ${RETHINKDB_HTTP_PORT} "
    echo "  RETHINKDB_CLUSTER_PORT  ${RETHINKDB_CLUSTER_PORT} "
    echo "======================================================="
}


start_empty_rethinkdb() {
    echo "Starting rethinkdb with no data..."
    (cd ${MCDB_DIR}; rethinkdb --driver-port ${MCDB_PORT} --cluster-port ${RETHINKDB_CLUSTER_PORT} --http-port ${RETHINKDB_HTTP_PORT} --daemon)
    scripts/db_running.py --port ${MCDB_PORT}
    echo "Started."
}

safely_start_rethinkdb() {
    pushd $BACKEND
    ./mcservers sstop rethinkdb
    sleep 2
    start_empty_rethinkdb
    popd
}

rebuild_test_database() {
    pushd $BASE
    echo "Building minimal test DB in rethinkdb..."
    MC_USERPW=test build-test-db.sh > /dev/null
    echo "Built."
    popd
}

set_env
print_message
set_locations
print_env_and_locations
safely_start_rethinkdb
rebuild_test_database

echo "Done create test DB."