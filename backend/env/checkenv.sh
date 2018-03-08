#!/usr/bin/env bash

config_file() {
    BASE="/etc/materialscommons/config"

    case "$SERVERTYPE" in
        production)
            echo ${BASE}.prod
            ;;
        *)
            echo ${BASE}.${SERVERTYPE}
            ;;
    esac
}

show_env() {
    echo "======================== ${SERVERTYPE} ========================"
    echo
    echo " Environment and Setup Variables: "
    echo "   MCUSER:                 ${MCUSER}"
    echo "   MCDB_PORT:              ${MCDB_PORT}"
    echo "   MC_SERVICE_PORT:        ${MC_SERVICE_PORT}"
    echo "   MC_API_SERVICE_PORT:    ${MC_API_SERVICE_PORT}"
    echo "   MC_PUB_SERVICE_PORT:    ${MC_PUB_SERVICE_PORT}"
    echo "   RETHINKDB_HTTP_PORT:    ${RETHINKDB_HTTP_PORT}"
    echo "   RETHINKDB_CLUSTER_PORT: ${RETHINKDB_CLUSTER_PORT}"
    echo "   MCDB_DIR:               ${MCDB_DIR}"
    echo "   MCDIR:                  ${MCDIR}"
    echo "   MCFS_HTTP_PORT:         ${MCFS_HTTP_PORT}"
    echo "   MCDB_CONNECTION:        ${MCDB_CONNECTION}"
    echo "   MC_ES_URL:              ${MC_ES_URL}"
    echo "   MC_ES_NAME              ${MC_ES_NAME}"
    echo "   MCDB_FILE:              ${MCDB_FILE}"
    echo "   MCSTORE_SRC:            ${MCSTORE_SRC}"
    echo "   MC_LOG_DIR:             ${MC_LOG_DIR}"
    echo
    echo " Binary paths:"
    echo "   rethinkdb binary:       $(which rethinkdb)"
    echo "   mcapiserver.py binary:  ./mcapiserver.py"
    echo "   mcstored binary:        ${MCSTOREDBIN}"
    echo "   mcapi.js binary:        servers/mcapi/mcapi.js"
    echo "   mcpub.js binary:        servers/mcpub/mcpub.js"
    echo
    echo " Commands: "
    echo "   rethinkdb command:      rethinkdb --driver-port $MCDB_PORT --cluster-port $RETHINKDB_CLUSTER_PORT --http-port $RETHINKDB_HTTP_PORT --daemon"
    echo "   elasticsearch command:  docker start ${MC_ES_NAME}"
    echo "   mcapiserver.py command: mcapiserver.py -p $MC_SERVICE_PORT > ${MC_LOG_DIR}/mcapiserver.out.${SERVERTYPE} 2>&1&"
    echo "   mcstored command:       ${MCSTOREDBIN} --http-port=${MCFS_HTTP_PORT} --mcdir=${MCDIR} --db-connect=localhost:$MCDB_PORT --es-url=${MC_ES_URL} > ${MC_LOG_DIR}/mcstored.out.${SERVERTYPE} 2>&1&"
    echo "   mcapi.js command:       nodemon --watch servers/mcapi --watch servers/lib servers/mcapi/mcapi.js -p $MC_API_SERVICE_PORT > ${MC_LOG_DIR}/mcapi.out.${SERVERTYPE} 2>&1&"
    echo "   mcpub.js command:       nodemon --watch servers/mcpub --watch servers/lib servers/mcpub/mcpub.js -p $MC_PUB_SERVICE_PORT > /tmp/mcpub.out.${SERVERTYPE} 2>&1&"
    echo
    echo " Environment Files:"
    echo "   Path: /etc/materialscommons/config.global"
    configfile=$(config_file)
    echo "   Path: ${configfile}"
    echo
}

set_echo_env() {
    source ${SERVERTYPE}.sh
    show_env
}

export SERVERTYPE=production
set_echo_env

export SERVERTYPE=test
set_echo_env

export SERVERTYPE=dev
set_echo_env

export SERVERTYPE=unit
set_echo_env

export SERVERTYPE=travisrun
set_echo_env