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
    # location of this script: backend/scripts
    DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    pushd $DIR
    BASE=`pwd`
    pushd '../'
    BACKEND=`pwd`
    pushd '../../'
    MC_BASE=`pwd`
    popd
    popd
    popd
}

check_locations() {
    echo "BASE:    $BASE"
    echo "BACKEND: $BACKEND"
    echo "MC_BASE: $MC_BASE"
}

set_python_env() {
    source ${BACKEND}/servers/etlserver/.python_env/bin/activate
}

reinstall_python_api() {
    pushd ${MC_BASE}/mcapi/python
    pip uninstall -y materials_commons
    python setup.py install
    popd
}

set_locations
# check_locations
set_python_env
reinstall_python_api
