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
    # location of this script, scripts, backend
    DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    pushd $DIR
    BASE=`pwd`
    pushd '../../'
    MCAPI=`pwd`
    pushd '..'
    BACKEND=`pwd`
    popd
    popd
    popd
}

set_locations

TESTS="${BASE}/tests.py"

# pip install pytest-watch
# https://pypi.python.org/pypi/pytest-watch

cd ${MCAPI}
ptw -- ${TESTS}