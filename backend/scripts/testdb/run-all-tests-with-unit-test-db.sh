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
    if [ -z "${MC_DOI_SERVICE_URL}" ]; then
        export MC_DOI_SERVICE_URL=https://ezid.lib.purdue.edu/
    fi
    # Publisher label
    if [ -z "${MC_DOI_PUBLISHER}" ]; then
        export MC_DOI_PUBLISHER='Materials Commons'
    fi
    # Dataset Publication (call back) line
    if [ -z "${MC_DOI_PUBLICATION_BASE}" ]; then
        export MC_DOI_PUBLICATION_BASE=http://mcpub.localhost/#/details
    fi

    # DOI Identification
    if [ -z "${MC_DOI_NAMESPACE}" ]; then
        export MC_DOI_NAMESPACE='doi:10.5072/FK2'
    fi
    if [ -z "${MC_DOI_USER}" ]; then
        export MC_DOI_USER=apitest
    fi
    if [ -z "${MC_DOI_PW}" ]; then
        export MC_DOI_PW=apitest
    fi

    # DB port for tests
    if [ -z "${MCDB_PORT}" ]; then
        export MCDB_PORT=40815
    fi

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
build_and_start_database
run_all_tests