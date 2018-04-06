#!/usr/bin/env bash
set -e

# default args
CLEAR="lite" # other options are "none", "all"

print_clear_option() {
    echo "Use option -c to control clearing of the database"
    echo "  none => database started if not running; but not cleared"
    echo "  lite => database started if not running; tables (except users and templates) are cleared"
    echo "  all => database is stopped; deleted; started; rebuilt (including templates and test users)"
    echo "  default = lite"
    echo "current setting:"
    echo "  -c ${CLEAR}"
}

# get startup type args
CMD=$1
if [ "$CMD" = "-h" ]; then
    print_clear_option
    exit
elif [ "$CMD" = "help" ]; then
    print_clear_option
    exit
elif [ "$CMD" = "-c" ]; then
    shift
    option=$1
    if [ "$option" = "none" ]; then
        CLEAR=$option
    fi
    if [ "$option" = "lite" ]; then
        CLEAR=$option
    fi
    if [ "$option" = "all" ]; then
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

print_message() {
    cat <<- EOF
Rebuilding rethinkDB for Materials Commons with a useful, empty, test database:
no projects, experiments or other data is defined; templates are loaded; and
4 test users defined: test@test.mc, another@test.mc, admin@test.mc,
and tadmin@test.mc. See make-users-for-test.py for details on users.
EOF
}

set_locations() {
    # location of this script, scripts, backend
    DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    pushd $DIR
    BASE=`pwd`
    pushd helpers
    HELPERS=`pwd`
    popd
    pushd '..'
    SCRIPTS=`pwd`
    pushd '..'
    BACKEND=`pwd`
    cd env
    ENV=`pwd`
    popd
    popd
    popd
}

set_env() {
    source ${ENV}/unit.sh
}

print_env_and_locations() {
    echo "----------- Test DB rebuild ENV settings --------------"
    echo "  BASE    - (see below) the location of this script and other helper scripts"
    echo "  HELPERS - the location of the helpers folder for base scripts"
    echo "  SCRIPTS - the location of the materialscommons.org/backend/scripts folder"
    echo "  BACKEND - the location of the materialscommons.org/backend folder"
    echo "  ENV     - the location of the environment scripts"
    echo "  BASE      ${BASE} "
    echo "  HELPERS   ${HELPERS} "
    echo "  SCRIPTS   ${SCRIPTS} "
    echo "  ENV       ${ENV} "
    echo "  BACKEND   ${BACKEND} "
    echo "  using environment --    ${SERVERTYPE} "
    echo "  MCDB_DIR                ${MCDB_DIR} "
    echo "  MCDB_PORT               ${MCDB_PORT} "
    echo "  RETHINKDB_HTTP_PORT     ${RETHINKDB_HTTP_PORT} "
    echo "  RETHINKDB_CLUSTER_PORT  ${RETHINKDB_CLUSTER_PORT} "
    echo "======================================================="
}

check_rethinkdb() {
    echo "Looking for rethinkdb..."
    echo "    -- SERVERTYPE = ${SERVERTYPE} "
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
    echo "    -- SERVERTYPE = ${SERVERTYPE} "
    (cd ${MCDB_DIR}; rethinkdb --driver-port ${MCDB_PORT} --cluster-port ${RETHINKDB_CLUSTER_PORT} --http-port ${RETHINKDB_HTTP_PORT} --daemon)
    # db_running.py blocks until DB is up; or exits with error after 100 retries
    scripts/db_running.py --port ${MCDB_PORT}
    echo "Started rethinkdb."
    popd
}

stop_rethinkbd() {
    pushd $BACKEND
    echo "Stopping rethinkdb on port MCDB_PORT ($MCDB_PORT)..."
    echo "    -- SERVERTYPE = ${SERVERTYPE} "
    RPID=$(ps -eo "pid,command" | grep rethinkdb | grep "driver-port $MCDB_PORT" | grep -v grep | head -1 | sed 's/^[ ]*//' | cut -f1 -d' ')
    if [ "$RPID" != "" ]; then
        kill ${RPID}
        echo "  Stopped rethinkdb with pid ${RPID}"
    fi
    sleep 2
    popd
}

clear_all_db_tables(){
    pushd $HELPERS
    echo "Clearing all tables in database in rethinkdb"
    echo "    -- SERVERTYPE = ${SERVERTYPE} ; MCDB_PORT = ${MCDB_PORT}"
    ./clear-database-tables.py --port $MCDB_PORT
    echo "Cleared test db"
    popd
}

clear_rethinkdb() {
    pushd $HELPERS
    echo "Clearing all databases in rethinkdb"
    echo "    -- SERVERTYPE = ${SERVERTYPE} ; MCDB_PORT = ${MCDB_PORT}"
    ./delete-databases.py --port $MCDB_PORT
    echo "Emptied test db"
    popd
}

rebuild_test_database() {
    pushd $HELPERS
    echo "Building minimal test DB in rethinkdb..."
    MC_USERPW=test ./build-test-db.sh
    echo "Built test DB."
    popd
}

if [ -z "$SERVERTYPE" ]; then
    export SERVERTYPE=unit
fi

set_locations
set_env
print_message
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
        echo "Restart rethinkDB ..."
        start_rethinkdb
    fi
    clear_all_db_tables
else
    echo "Starting test DB (if not running)"
    if ! check_rethinkdb; then
        start_rethinkdb
    fi
fi
echo "Database started, rebuilt... "
echo "    -- SERVERTYPE = ${SERVERTYPE} ; MCDB_PORT = ${MCDB_PORT} ; rebuild type = ${CLEAR} "
echo "Done with setup and starting rethinkdb."
