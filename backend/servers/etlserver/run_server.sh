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
    ETLSERVER="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    pushd ${ETLSERVER}/..
    SERVERS=`pwd`
    pushd ..
    BACKEND=`pwd`
    popd
    popd
}

guard_check(){
    OK="ok"
    if [ "${SERVERTYPE}" = "" ]; then
        echo "The SERVERTYPE variable is not set - can not run the etl REST server without it"
        OK="not"
    fi
    if [ "${MC_ETL_SERVICE_PORT}" = "" ]; then
        echo "The MC_ETL_SERVICE_PORT variable is not set - can not run the etl REST server without it"
        OK="not"
    fi
    if [ "${MC_LOG_DIR}" = "" ]; then
        echo "The MC_LOG_DIR variable is not set - can not run the etl REST server without it"
        OK="not"
    fi
}

export SERVERTYPE=${1-$SERVERTYPE}
set_locations
guard_check

if [ "${OK}" == "ok" ]; then
    # I realize that this is redundant, but ...
    source ${BACKEND}/env/${SERVERTYPE}.sh
    source /etc/materialscommons/config.${SERVERTYPE}
    source ${ETLSERVER}/.python_env/bin/activate
    pushd ${SERVERS}
    echo "Starting ETL server"
    python mc_etlserver.py ${SERVERRTYPE}
    popd
fi
