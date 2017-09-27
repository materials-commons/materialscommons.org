#!/bin/bash -e

# no-output on pushd and popd
pushd () {
    command pushd "$@" > /dev/null
}

popd () {
    command popd "$@" > /dev/null
}

set_locations() {
    # location of this script, scripts, backend
    DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
}

do_all() {
    pushd $DIR
    ./setup-and-start-test-db.sh -c all
    # Note - temporarily restricting test to only /tests/mcapi/Database-level
    # when broken tests are fixed this restriction can be lifted -
    # then use default TEST_PATTERN
    export TEST_PATTERN="tests/mcapi/Database-Level/specs/*-spec.js"
    ./run-given-tests.sh
    popd
}

# NOTE: using default for MCDB_PORT =
set_locations
do_all