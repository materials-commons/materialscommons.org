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
UPLOAD_FOLDER='/tmp/mc_etl'
if [ -z "${MCDIR}" ]; then
    UPLOAD_FOLDER=${MCDIR}
fi
UPLOAD_FOLDER=${UPLOAD_FOLDER}/etlStaging/
echo "Setting upload folder: ${UPLOAD_FOLDER}"
mkdir -p ${UPLOAD_FOLDER}
echo "DIR = ${DIR}"
echo "BACKEND = ${BACKEND}"
source ${BACKEND}/env/dev.sh
echo "--------- WARNING --------------------------------"
echo "  Depends on ~/PythonEnvs/python3dev/bin/activate "
echo "    must be defined in local environment          "
echo "--------- WARNING --------------------------------"
source ~/PythonEnvs/python3dev/bin/activate

cd ${BACKEND}
${BACKEND}/mcetlserver.py