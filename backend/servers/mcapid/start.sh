#!/bin/bash

nodemon --watch actions --watch config --watch lib --watch model --watch tasks --watch initializers --exec "run_mcapid.sh mcapid-${SERVERTYPE}"
