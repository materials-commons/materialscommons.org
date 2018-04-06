#!/usr/bin/env bash
set -e

# no-output on pushd and popd
pushd () {
    command pushd "$@" > /dev/null
}

popd () {
    command popd "$@" > /dev/null
}

print_message() {
    cat <<- EOF
This script runs all the test scripts indicated by the pattern TEST_PATTERN.
If GREP_PATTERN is set it will be used as the -g option in mocha test.
If TEST_CONTINUOUS is set, then the tests will be run in monitor mode; rerunning when
there are any changes to the files/directories (colon-seperated) in TEST_CONTINUOUS. For example:
TEST_CONTINUOUS=servers/mcapi/db/model/experiments.js:servers/mcapi/resources/projects/experiments
means that nodemon would be run with the settings
--watch servers/mcapi/db/model/experiments.js --watch servers/mcapi/resources/projects/experiments
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
    if [ -z "$SERVERTYPE" ]; then
        export SERVERTYPE=unit
    fi

    source ${BACKEND}/env/${SERVERTYPE}.sh

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

    # Default TEST_PATTERN
    if [ -z "${TEST_PATTERN}" ];then
        export TEST_PATTERN="tests/**/specs/*-spec.js"
    fi

}

print_env() {
    echo " = = = = Test env: ${SERVERTYPE} = = = ="
    echo " MC_DOI_SERVICE_URL: $MC_DOI_SERVICE_URL"
    echo " MC_DOI_PUBLISHER  : $MC_DOI_PUBLISHER"
    echo " MC_DOI_NAMESPACE  : $MC_DOI_NAMESPACE"
    echo " MC_DOI_USER       : $MC_DOI_USER"
    echo " MCDB_PORT         : $MCDB_PORT"
    echo " TEST_PATTERN      : $TEST_PATTERN"
    if [ -z "${TEST_CONTINUOUS}" ]; then
    echo " TEST_CONTINUOUS   : (is not set)"
    else
    echo " TEST_CONTINUOUS   : $TEST_CONTINUOUS"
    fi
    if [ -z "${GREP_PATTERN}" ]; then
    echo " GREP_PATTERN      : (is not set)"
    else
    echo " GREP_PATTERN      : $GREP_PATTERN"
    fi
    echo ""
}

check_rethinkdb() {
    echo "Looking for rethinkdb..."
    echo "   SERVERTYPE = ${SERVERTYPE}"
    RPID=$(ps -eo "pid,command" | grep rethinkdb | grep "driver-port $MCDB_PORT" | grep -v grep | head -1 | sed 's/^[ ]*//' | cut -f1 -d' ')
    if [ "$RPID" = "" ]; then
        echo "   Database not running on port $MCDB_PORT (MCDB_PORT); please start it!"
        return -1
    fi
    echo "   Database found on port $MCDB_PORT (MCDB_PORT)"
    return 0
}

run_all_tests(){
    pushd $BACKEND
    if [ -z "${GREP_PATTERN}" ]; then
        echo "(start) run all tests in TEST_PATTERN"
        node_modules/.bin/_mocha "${TEST_PATTERN}"
    else
        echo "(start) run all tests in TEST_PATTERN with GREP_PATTERN applied"
        node_modules/.bin/_mocha "${TEST_PATTERN}" -g "${GREP_PATTERN}"
    fi
    popd
}

monitor_tests(){
    pushd $BACKEND
    echo "(start) monitoring tests in TEST_PATTERN"
    watches=""
    while read -d ":" part; do
        watches="$watches --watch $part"
    done <<< ${TEST_CONTINUOUS}
    watches="$watches --watch $part"
    echo "watching: $watches"
    if [ -z "${GREP_PATTERN}" ]; then
        nodemon ${watches} node_modules/.bin/_mocha "${TEST_PATTERN}"
    else
        nodemon ${watches} node_modules/.bin/_mocha "${TEST_PATTERN}" -g "${GREP_PATTERN}"
    fi
    popd
}

print_message
set_locations
set_env
print_env
if ! check_rethinkdb; then
    exit -1
fi
if [ -z "${TEST_CONTINUOUS}" ]; then
    run_all_tests
else
    monitor_tests
fi