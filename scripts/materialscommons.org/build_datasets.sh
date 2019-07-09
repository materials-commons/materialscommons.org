#!/bin/sh
. ~/.bashrc
cd ~/workspace/src/github.com/materials-commons/materialscommons.org/backend/scripts
. ../env/production.sh
./populateZipFiles.js --port 28015 -a
