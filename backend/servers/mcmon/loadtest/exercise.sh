#!/usr/bin/env bash

# cd location of script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

# cd backend
cd ../../..

i='1'
while [ $i != 0 ]; do
    node_modules/.bin/_mocha $DIR/toggle-publish.js
    sleep 2
done
