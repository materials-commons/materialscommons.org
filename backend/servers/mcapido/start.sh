#!/bin/bash

nodemon --watch actions \
        --watch config \
        --watch lib \
        --watch tasks \
        --watch initializers \
        --watch ../shared \
        --watch ../lib \
        --exec "run_mcapid.sh mcapid-${SERVERTYPE}"
