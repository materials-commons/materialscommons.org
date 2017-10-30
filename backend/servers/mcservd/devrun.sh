#!/bin/bash

MCSERVED_PID=$(ps -eo "pid,command" | grep "actionhero start" | grep -v grep | sed 's/^[ ]*//' | cut -f1 -d' ')
kill ${MCSERVED_PID}
npx actionhero start
