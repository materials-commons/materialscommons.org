#!/bin/bash

MCAPID_PID=$(ps -eo "pid,command" | grep "actionhero start" | grep -v grep | sed 's/^[ ]*//' | cut -f1 -d' ')
if [ "$MCAPID_PID" != "" ]; then
    kill ${MCAPID_PID}
fi
npx actionhero start --title=mcapid-${SERVERTYPE}
