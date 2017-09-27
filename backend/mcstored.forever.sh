#!/bin/sh

shift
> ${MC_LOG_DIR}/mcstored.out.${SERVERTYPE}
MAX_RETRIES=20
CURRENT_RETRY=0
if [ "${SERVERTYPE}" = "unit" ]; then
    MAX_RETRIES=3
fi
if [ "${SERVERTYPE}" = "dev" ]; then
    MAX_RETRIES=3
fi
LOG_FILE=${MC_LOG_DIR}/mcstored.out.${SERVERTYPE}
while [ 1 ];
do
    ${MCSTOREDBIN} $* >> ${LOG_FILE} 2>&1
    CURRENT_RETRY=$(($CURRENT_RETRY+1))
    if [ $CURRENT_RETRY -eq ${MAX_RETRIES} ]; then
        echo "============================" >> ${LOG_FILE}
        echo "  ${MCSTOREDBIN} MAX RETRIES (${MAX_RETRIES}) REACHED... EXITING..." >> ${LOG_FILE}
        echo "============================" >> ${LOG_FILE}
        break
    fi
    echo "============================" >> ${LOG_FILE}
    echo "Restarting ${MCSTOREDBIN} Retry ${CURRENT_RETRY} of ${MAX_RETRIES}" >> ${LOG_FILE}
    echo "============================" >> ${LOG_FILE}
done
