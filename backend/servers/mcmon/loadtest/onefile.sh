#!/usr/bin/env bash

# cd location of script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

# cd backend
cd ../../..

node_modules/.bin/_mocha $DIR/add-file.js -g "office"