#!/usr/bin/env bash

# default args
CLEAR="all" # other options are "none", "lite"

# get startup type args
CMD=$1
shift
if [ "$CMD" = "-h" ]; then
    print_help
    exit
elif [ "$CMD" = "help" ]; then
    print_help
    exit
elif [ "$CMD" = "-c" ]; then
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
Rebuilding rethinkDB for Materials Commons with a useful, empty, test database:
no projects, experiments or other data is defined; templates are loaded; and
4 test users defined: test@test.mc, another@test.mc, admin@test.mc,
and tadmin@test.mc. See makeUserForTest.py for details on users.
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
    echo "  none => database started if not running; but not cleared"
    echo "  lite => database started if not running; tables (except users and templates) are cleared"
    echo "  all => database is stopped; deleted; started; rebuilt "
    echo "  default = all"
    echo "current setting:"
    echo "  -c ${CLEAR}"
}

check_rethinkdb() {
    echo "Looking for rethinkdb..."
    RPID=$(ps -eo "pid,command" | grep rethinkdb | grep "driver-port $MCDB_PORT" | grep -v grep | head -1 | sed 's/^[ ]*//' | cut -f1 -d' ')
    if [ "$RPID" = "" ]; then
        echo "   Database not running on port $MCDB_PORT (MCDB_PORT)"
        return -1
    fi
    echo "  Database found on port $MCDB_PORT (MCDB_PORT)"
    return 0
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
    echo "Stopping rethinkdb on port MCDB_PORT ($MCDB_PORT)..."
    RPID=$(ps -eo "pid,command" | grep rethinkdb | grep "driver-port $MCDB_PORT" | grep -v grep | head -1 | sed 's/^[ ]*//' | cut -f1 -d' ')
    if [ "$RPID" != "" ]; then
        kill ${RPID}
        echo "  Stopped rethinkdb with pid ${RPID}"
    fi
    sleep 2
    popd
}

clear_all_db_tables(){
    pushd $BACKEND
    echo "Clearing all tables in database in rethinkdb"
    scripts/testdb/deleteDatabases.py --port $MCDB_PORT
    echo "Cleared test db"
    popd
}

clear_rethinkdb() {
    pushd $BACKEND
    echo "Clearing all databases in rethinkdb"
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
    start_rethinkdb
    clear_rethinkdb
    rebuild_test_database
    echo "Done creating and starting test DB."
elif [ "${CLEAR}" = "lite" ]; then
    echo "Starting test DB (if not running); clearing data tables"
    if ! check_rethinkdb; then
        start_rethinkdb
    fi
    clear_all_db_tables
else
    echo "Starting test DB (if not running)"
    if ! check_rethinkdb; then
        start_rethinkdb
    fi
fi
echo "Done with setup and starting rethinkdb."
