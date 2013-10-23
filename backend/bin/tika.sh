#!/bin/sh

SCRIPT_DIR=$(cd ${0%/*} && pwd)
java -jar $SCRIPT_DIR/tika-app-1.3.jar $*
