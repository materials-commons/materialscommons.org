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
This script runs all the test scripts (e.g. *spec.js) in mc/backend/test.
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

set_env() {
    ## DOI
    # Remote DOI service URL
    export MC_DOI_SERVICE_URL=https://ezid.lib.purdue.edu/

    # Publisher label
    export MC_DOI_PUBLISHER='Materials Commons'

    # Dataset Publication (call back) line
    export MC_DOI_PUBLICATION_BASE=http://mcpub.localhost/#/details

    # DOI Identification
    export MC_DOI_NAMESPACE='doi:10.5072/FK2'
    export MC_DOI_USER=apitest
    export MC_DOI_PW=apitest

    # DB port for tests
    export MCDB_PORT=40815
}

print_env() {
    echo " = = = = Test env = = = ="
    echo " MC_DOI_SERVICE_URL: $MC_DOI_SERVICE_URL"
    echo " MC_DOI_PUBLISHER  : $MC_DOI_PUBLISHER"
    echo " MC_DOI_NAMESPACE  : $MC_DOI_NAMESPACE"
    echo " MC_DOI_USER       : $MC_DOI_USER"
    echo " MCDB_PORT         : $MCDB_PORT"
    echo ""
}

stop_all_mcservers() {
    pushd $BACKEND
    echo "Shutting down all mcservers!"
    mcservers stop -u
    mcservers stop -d
    echo "Stopped all mcservers"
    popd
}

build_and_start_database(){
    pushd $DIR
    echo "(start) running shell script 'start-with-test-db.sh' "
    start-with-test-db.sh
    echo "(done)  running shell script 'start-with-test-db.sh' "
    popd
}

run_all_tests(){
    pushd $BACKEND
    echo "(start) running tests - eg. 'npm test' "
    node_modules/.bin/_mocha "tests/mcapi/Database-level/specs/**/*-spec.js"
    echo "(done)  running tests"
    popd
}

print_message
set_locations
set_env
print_env
stop_all_mcservers
build_and_start_database
run_all_tests