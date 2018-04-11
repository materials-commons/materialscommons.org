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
echo "DIR = ${DIR}"
echo "BACKEND = ${BACKEND}"
source ${BACKEND}/env/dev.sh
UPLOAD_FOLDER=${MCDIR}/etlStaging/
mkdir -p ${UPLOAD_FOLDER}
echo "--------- WARNING --------------------------------"
echo "  Assumes that test environment is set            "
echo "    (currently: ${env} )"
echo "--------- WARNING --------------------------------"
echo "  Setting for MCDIR = ${MCDIR}"
echo "  Setting upload folder: ${UPLOAD_FOLDER}"
echo "--------- WARNING --------------------------------"
echo "  Depends on ~/PythonEnvs/python3dev/bin/activate "
echo "    must be defined in local environment          "
echo "--------- WARNING --------------------------------"
source ~/PythonEnvs/python3dev/bin/activate

cd ${BACKEND}
${BACKEND}/mcetlserver.py