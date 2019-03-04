#!/usr/bin/env bash

# travisrun.sh - to support travis tests of mcapi/python, the Python API
# initially a copy of dev.sh (and should probaly be maintained as that)

# Note: often this will be redundent, but it simplifies use
# source to set all environment variables for the type of server
export SERVERTYPE=travisrun

export MC_SERVICE_PORT=5002
export MC_API_SERVICE_PORT=5004
export MC_API_GLOBUS_SERVICE_PORT=5042
export MC_ETL_SERVICE_PORT=5032
export MCSERV_PORT=5052
export MCDB_PORT=30815
export MCDB_CONNECTION="localhost:$MCDB_PORT"
export MCDB_DIR=~/testdb
export RETHINKDB_HTTP_PORT=8090
export RETHINKDB_CLUSTER_PORT=31815
export MCSTOREDBIN=testbin/mcstored
export MCSERVBIN=testbin/mcserv
export MC_ES_URL="http://localhost:9500"
export MC_ES_NAME="mc-es-test"
export MC_LOG_DIR=/tmp
if [ "$MCDB_FILE" = "" ]; then
    export MCDB_FILE=../test_data/rethinkdb_dump_test_data.tar.gz
fi
export MCDIR=~/mcdir/mcfs/data/test:/mcfs/data/materialscommons
export MCFS_HTTP_PORT=5012

if [ -f /etc/materialscommons/config.dev ]; then
    . /etc/materialscommons/config.dev
fi

if [ ! -d ${MCDB_DIR} ]; then
    mkdir -p ${MCDB_DIR}
fi

if [ "$REINIT" = "t" ]; then
    (cd ${MCDB_DIR}; rm -rf rethinkdb_data)
fi

export MCAPID_COMMAND="start.sh mcapid-${SERVERTYPE}"
export MCAPID_PORT=5028
export REDIS_PORT=5031

# normally these would be in /etc/materialscommons/org - but included here
# except for the values of usernames and passwords,
# for documentaion and completeness

## General - base Materials commons links
export MC_BASE_API_LINK=http://mctest.localhost/#
export MCPUB_BASE_API_LINK=http://mcpub.localhost/#

# see above --
# export MCDIR=${HOME}/working/MaterialsCommons/mcdir:${HOME}/working/MaterialsCommons/mcdir
# export MCDB_CONNECTION="localhost:30815"
# export MCDB_TYPE="rethinkdb" # - this is default in code
# export MCDB_NAME="materialscommons" # - this is default in code
# export MCDB_DUMPS=${HOME}/working/MaterialsCommons/rethinkdb_dumps
# export MCDB_FILE=$MCDB_DUMPS/target.tar.gz

## Email - these should not, normally be involved in tests.
# export MC_VERIFY_EMAIL=''
# export MC_VERIFY_PASS=''
# export MC_VERIFY_LINK=http://mctest.localhost/#/validate
# export MCPUB_VERIFY_LINK=http://mcpub.localhost/#/validate
# export MC_SMTP_HOST=''

## DOI - doi tests are normally disabled (e.g. skipped)
# Remote DOI service URLs
export MC_DOI_SERVICE_URL=https://ezid.lib.purdue.edu/
export MC_DOI_SERVICE_URL=https://ez.test.datacite.org/
export MC_DOI_USER_INTERFACE_URL=https://search.test.datacite.org/works
# Publisher label
export MC_DOI_PUBLISHER='Materials Commons'
# Dataset Publication (call back) line
export MC_DOI_PUBLICATION_BASE=http://mcpub.localhost/#/data/dataset/
# DOI Identification
export MC_DOI_NAMESPACE='doi:10.33587'
export MC_DOI_USER=''
export MC_DOI_PW=''

## Globus - globus tests are normally disabled (e.g. skipped)
export MC_CONFIDENTIAL_CLIENT_USER=''
export MC_CONFIDENTIAL_CLIENT_PW=''
export MC_CONFIDENTIAL_CLIENT_ENDPOINT=''
