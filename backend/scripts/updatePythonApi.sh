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
    pushd ${DIR}
    BASE=`pwd`
    pushd '..'
    BACKEND=`pwd`
    pushd '../../mcapi/python'
    PYTHON_API_DIR=`pwd`
    popd
    popd
    popd
}

update_pyton_api() {
    echo "Update of Python API"
    pushd ${BACKEND}/servers/etlserver
    source .python_env/bin/activate
    probe=`python --version`
    echo ".python_env: Python version = $probe"
    popd
    pushd ${PYTHON_API_DIR}
    git pull
    pip uninstall -y materials-commons
    python setup.py install
    echo "==== Python API version check ===="
    cat materials_commons/VERSION.txt
    pip list | grep materials-commons
    echo "=================================="
    popd
}

set_locations
echo "BASE           = $BASE"
echo "BACKEND        = $BACKEND"
echo "PYTHON_API_DIR = $PYTHON_API_DIR"
update_pyton_api