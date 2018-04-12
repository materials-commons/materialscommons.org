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

set_locations

# echo "ETLSERVER = ${ETLSERVER}"
# echo "SERVERS = ${SERVERS}"
# echo "BACKEND = ${BACKEND}"

SANITY_SCRIPT="${ETLSERVER}/check_sanity.sh"
source ${SANITY_SCRIPT}
echo "ok"