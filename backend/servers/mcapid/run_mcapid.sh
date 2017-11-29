#!/bin/bash

MCSERVED_PID=$(ps -eo "pid,command" | grep "actionhero start" | grep -v grep | sed 's/^[ ]*//' | cut -f1 -d' ')
if [ "$RPID" != "" ]; then
    kill ${MCSERVED_PID}
fi
npx actionhero start --title=mcapid-${SERVERTYPE}
