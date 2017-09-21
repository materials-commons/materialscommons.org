#!/usr/bin/env bash

# default args
CLEAR="all" # other options are "none", "lite"

# get args
CMD=$1
shift
if [ "$CMD" = "-c" ]; then
    option=$1
    if [ "$option" = "none" ]; then
        CLEAR=$option
    fi
    if [ "$option" = "lite" ]; then
        CLEAR=$option
    fi
fi

# no-output on pushd and popd
pushd () {
    command pushd "$@" > /dev/null
}

popd () {
    command popd "$@" > /dev/null
}

set_env() {
    if [ -z "${MCDB_DIR}" ]; then
        export MCDB_DIR=~/unitdb
    fi
    if [ -z "${MCDB_PORT}" ]; then
        export MCDB_PORT=40815
    fi
    if [ -z "${RETHINKDB_HTTP_PORT}" ]; then
        export RETHINKDB_HTTP_PORT=8070
    fi
    if [ -z "${RETHINKDB_CLUSTER_PORT}" ]; then
        export RETHINKDB_CLUSTER_PORT=41815
    fi
    if [ ! -d ${MCDB_DIR} ]; then
        mkdir ${MCDB_DIR}
    fi
}

print_message() {
    cat <<- EOF
This script will start RethinkDB for Materials Commons with
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
    echo "  MCDB_DIR                ${MCDB_DIR} "
    echo "  MCDB_PORT               ${MCDB_PORT} "
    echo "  RETHINKDB_HTTP_PORT     ${RETHINKDB_HTTP_PORT} "
    echo "  RETHINKDB_CLUSTER_PORT  ${RETHINKDB_CLUSTER_PORT} "
    echo "======================================================="
}

print_clear_option() {
    echo "Use option -c to control clearing of the database"
    echo "  none => database is not cleared"
    echo "  lite => database tables are cleared and reset"
    echo "  all => database is stopped; deleted; started; rebuilt "
    echo "  default = all"
    echo "current setting:"
    echo "  -c ${CLEAR}"
}

delete_database_files() {
    echo "Clearing database dir: ${MCDB_DIR} "
    (cd ${MCDB_DIR}; rm -rf rethinkdb_data)
}

start_rethinkdb(){
    pushd $BACKEND
    echo "Starting rethinkdb (${MCDB_PORT})..."
    (cd ${MCDB_DIR}; rethinkdb --driver-port ${MCDB_PORT} --cluster-port ${RETHINKDB_CLUSTER_PORT} --http-port ${RETHINKDB_HTTP_PORT} --daemon)
    # db_running.py blocks until DB is up; or exits with error after 100 retries
    scripts/db_running.py --port ${MCDB_PORT}
    echo "Started rethinkdb."
    popd
}

stop_rethinkbd() {
    pushd $BACKEND
    ./mcservers sstop rethinkdb -u
    sleep 2
    popd
}

clear_rethinkdb() {
    pushd $BACKEND
    echo "Clearing test db"
    scripts/testdb/deleteDatabases.py --port $MCDB_PORT
    echo "Emptied test db"
    popd
}

rebuild_test_database() {
    pushd $BASE
    echo "Building minimal test DB in rethinkdb..."
    MC_USERPW=test build-test-db.sh > /dev/null
    echo "Built test DB."
    popd
}

set_env
print_message
set_locations
print_env_and_locations
print_clear_option
if [ "${CLEAR}" = "all" ]; then
    echo "Completely rebuilding test DB."
    stop_rethinkbd
    delete_database_files
    start_rethinkdb
    clear_rethinkdb
    rebuild_test_database
    echo "Done create test DB."
fi
