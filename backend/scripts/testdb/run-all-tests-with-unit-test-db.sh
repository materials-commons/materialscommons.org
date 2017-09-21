#!/usr/bin/env bash

# no-output on pushd and popd
pushd () {
    command pushd "$@" > /dev/null
}

popd () {
    command popd "$@" > /dev/null
}

print_message() {
    cat <<- EOF
This script will runs all the test scripts (e.g. *spec.js) mc/backend/test.
Note: it will clear and reload the test database: on port 40815.
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

build_database(){
    pushd $DIR
    echo "(start) running shell script 'start-with-test-db.sh' "
    start-with-test-db.sh
    echo "(done)  running shell script 'start-with-test-db.sh' "
    popd
}

run_all_tests(){
    pushd $BACKEND
    echo "(start) running tests - eg. 'npm test' "
    MCDB_PORT=40815 node_modules/.bin/_mocha "tests/mcapi/Database-level/specs/**/*-spec.js"
    echo "(done)  running tests"
    popd
}

print_message
set_locations
build_database
run_all_tests