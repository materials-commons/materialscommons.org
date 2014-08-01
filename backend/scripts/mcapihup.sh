#!/bin/sh
#
# Sends HUP signal to the mcapiserver so that it reloads its list of users.
#

MC_SERVICE_PORT=$1
ps -eo "pid,command" | grep mcapiserver.py | grep "p $MC_SERVICE_PORT" | grep -v grep | sed 's/^[ ]*//' | cut -f1 -d' ' | while read line
do
    kill -HUP $line
done
