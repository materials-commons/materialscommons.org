#!/usr/bin/env bash

# no-output on pushd and popd
pushd () {
    command pushd "$@" > /dev/null
}

popd () {
    command popd "$@" > /dev/null
}

set_locations() {
    # location of this script, scripts, backend
    ETLSERVER="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    pushd ${ETLSERVER}/..
    SERVERS=`pwd`
    pushd ..
    BACKEND=`pwd`
    popd
    popd
}

check_python() {
    # python version must be at least 3.6
    PVERSION=$(python --version 2>&1)
    $(python -c 'import sys; exit(1) if sys.version_info.major < 3 or (sys.version_info.major == 3 and sys.version_info.minor < 6) else exit(0)')
    if [ "$?" = "1" ]; then
        echo "Python version, ${PVERSION}, is less then 3.6 <-----"
        ALL_OK=-1
    else
        echo "Python version, ${PVERSION}, is ok"
        check_python_modules
    fi
}

check_python_modules() {
    for line in $(cat "${ETLSERVER}/requirements.txt"); do
        # one line, flask-api, is not actually the module name (sigh!)
        if [ "$line"  = "flask-api" ]; then
            line="flask"
        fi
        $(python -c "import importlib; exit(0) if importlib.util.find_spec('$line') else exit(1)")
        if [ "$?" = "1" ]; then
            echo "  Python module, ${line}, is not loaded <-----"
            ALL_OK=-1
        else
            echo "  Python module, ${line}, is ok"
        fi
    done
}

check_env_variables() {
    if [ "${MCDB_PORT}" = "" ]; then
        echo "MCDB_PORT is not defined; or is empty <-----"
        ALL_OK=-1
    else
        echo "MCDB_PORT = ${MCDB_PORT}"
    fi
    if [ "${MC_FACTORY_PORT}" = "" ]; then
        echo "MC_FACTORY_PORT is not defined; or is empty <-----"
        ALL_OK=-1
    else
        echo "MC_FACTORY_PORT = ${MC_FACTORY_PORT}"
    fi
    if [ "${MC_ETL_BASE_DIR}" = "" ]; then
        echo "MC_ETL_BASE_DIR is not defined; or is empty <-----"
        ALL_OK=-1
    else
        echo "MC_ETL_BASE_DIR = ${MC_ETL_BASE_DIR}"
    fi

    if [ "${MC_CONFIDENTIAL_CLIENT_USER}" = "" ]; then
        echo "MC_CONFIDENTIAL_CLIENT_USER is not defined; or is empty <-----"
        ALL_OK=-1
    else
        echo "MC_CONFIDENTIAL_CLIENT_USER = ${MC_CONFIDENTIAL_CLIENT_USER}"
    fi

    if [ "${MC_CONFIDENTIAL_CLIENT_PW}" = "" ]; then
        echo "MC_CONFIDENTIAL_CLIENT_PW is not defined; or is empty <-----"
        ALL_OK=-1
    else
        echo "MC_CONFIDENTIAL_CLIENT_PW is set"
    fi

    if [ "$MC_CONFIDENTIAL_CLIENT_ENDPOINT" = "" ]; then
        echo "MC_CONFIDENTIAL_CLIENT_ENDPOINT is not defined; or is empty <-----"
        ALL_OK=-1
    else
        echo "MC_CONFIDENTIAL_CLIENT_ENDPOINT = ${MC_CONFIDENTIAL_CLIENT_ENDPOINT}"
    fi

}

check_faktory() {
    R=$(ps -eo "pid,command" | grep faktory | grep -v grep)
    if [ "$R" = "" ]; then
        echo "faktory does not appear to be running <-----"
        ALL_OK=-1
    else
        echo "faktory appears to be running"
    fi
}

check_worker() {
    R=$(ps -eo "pid,command" | grep python | grep -v grep | grep 'run_worker')
    if [ "$R" = "" ]; then
        echo "ETL/Globus worker does not appear to be running <-----"
        ALL_OK=-1
    else
        echo "ETL/Globus worker appears to be running"
    fi
}

check_mc_endpoint() {
    echo "Checking conditions for running Globus clients"
    pushd ${SERVERS}
    MESSAGE=$(python -m etlserver.scripts.check_mc_upload_endpoint 2>&1)
    STATUS=$?
    if [ "$STATUS" = "0" ]; then
        echo 'ok'
    else
        echo $MESSAGE
    fi
    popd
    echo "check_mc_endpoint"
}

set_locations
# echo "ETLSERVER = ${ETLSERVER}"
# echo "SERVERS = ${SERVERS}"
# echo "BACKEND = ${BACKEND}"

ALL_OK=0

# is Python env set up
check_python
# are expected env variables set
check_env_variables
# is faktory running
check_faktory
# is ELT/Globus worker running
check_worker
# is MaterialsCommons confidential client endpoint available
check_mc_endpoint

exit $ALL_OK