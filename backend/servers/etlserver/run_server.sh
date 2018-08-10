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
    if [ ! -f ${ETLSERVER}/.python_env/bin/activate ]; then
        echo "The python environment for etl REST is missing..."
        echo "  set it up at ${ETLSERVER} "
        echo "  with the command python command 'virtualenv .python_env -p python3' "
        OK="not"
    fi
}

export SERVERTYPE=${1-$SERVERTYPE}
set_locations
guard_check

if [ "${OK}" == "ok" ]; then
    # I realize that this my be redundant, but ...
    source ${BACKEND}/env/${SERVERTYPE}.sh
    source /etc/materialscommons/config.${SERVERTYPE}
    source ${ETLSERVER}/.python_env/bin/activate
    pushd ${BACKEND}
    python -m servers.etlserver.app.mc_etlserver ${SERVERRTYPE}
    popd
fi
