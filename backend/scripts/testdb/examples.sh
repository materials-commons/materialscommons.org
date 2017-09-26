#!/usr/bin/env bash -e

## NOTE all of these examples assume that you are starting in the directory
## materialscommons.org/backend; all these examples presume
## the default setting for MCDB_PORT and other environment variables

## batch run of all tests in backend/tests/**/specs/*-spec.js (the default)
## starting with a completely rebuild database on the default port
## default for setup is 'all' = completely rebuild test databases
# scripts/testdb/setup-and-start-test-db.sh
# scripts/testdb/run-given-tests.sh

## batch run of all tests for a particular test pattern
## starting with a completely rebuild database on the default port
## default for setup is 'all' = completely rebuild test databases
# scripts/testdb/setup-and-start-test-db.sh
# export TEST_PATTERN="tests/mcapi/Database-Level/specs/files*-spec.js"
# scripts/testdb/run-given-tests.sh

## batch run of one test in a particular file
## starting with a completely rebuild database on the default port
## setup is 'all' = completely rebuild test databases
# scripts/testdb/setup-and-start-test-db.sh -c all
# export TEST_PATTERN="tests/mcapi/Database-Level/specs/projects-spec.js"
# export GREP_PATTERN="find project in all projects"
# scripts/testdb/run-given-tests.sh

## batch run of one test in a particular file
## starting with a completely clean database on the default port
## setup is 'lite' = clear all tables (except users and templates) in test databases
# scripts/testdb/setup-and-start-test-db.sh -c lite
# export TEST_PATTERN="tests/mcapi/Database-Level/specs/projects-spec.js"
# export GREP_PATTERN="find project in all projects"
# scripts/testdb/run-given-tests.sh

## monitor run of one test in a particular file while watching related source files
## starting with a completely clean database on the default port
## setup is 'none' = no changes to database (only start, if stopped)
scripts/testdb/setup-and-start-test-db.sh -c none
export TEST_CONTINUOUS="servers/mcapi/db/model/projects.js"
export TEST_CONTINUOUS=${TEST_CONTINUOUS}:"servers/mcapi/resources/projects/projects.js"
export TEST_PATTERN="tests/mcapi/Database-Level/specs/projects-spec.js"
export GREP_PATTERN="find project in all projects"
scripts/testdb/run-given-tests.sh