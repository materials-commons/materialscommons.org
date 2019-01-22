#!/usr/bin/env bash

set_locations() {
    BASE="$HOME/workspace/src/github.com/materials-commons/materialscommons.org/backend/scripts"
    BACKEND="$HOME/workspace/src/github.com/materials-commons/materialscommons.org/backend"
    PYTHON_API_DIR="$HOME/workspace/src/github.com/materials-commons/mcapi/"
}

update_python_api() {
    echo "Update of Python API"
    pushd ${BACKEND}/servers/etlserver
    source .python_env/bin/activate
    probe=`python --version`
    echo ".python_env: Python version = $probe"
    popd
    pushd ${PYTHON_API_DIR}
    git pull
    probe=`pip list | grep materials-commons`
    if [ "${probe}" != "" ]; then
        pip uninstall -y materials-commons
    fi
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
update_python_api
