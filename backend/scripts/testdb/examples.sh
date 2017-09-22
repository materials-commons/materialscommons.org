#!/usr/bin/env bash

## NOTE all of these examples assume that you are starting in the directory
## materialscommons.org/backend

## batch run of all tests in backend/tests/**/specs/*-spec.js
## starting with a completely rebuild database on the default port
## default for setup is 'all' = completely rebuild test databases
# scripts/testdb/setup-and-start-test-db.sh
# export