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
    pushd ${DIR}/..
    BACKEND=`pwd`
    popd
}

set_locations
echo "Setting upload folder: /tmp/test-uploads"
mkdir -p /tmp/test-uploads
echo "DIR = ${DIR}"
echo "BACKEND = ${BACKEND}"
source ${BACKEND}/env/dev.sh

cd ${BACKEND}
${BACKEND}/mcetlserver.py