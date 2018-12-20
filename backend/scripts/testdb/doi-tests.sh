#!/usr/bin/env bash
set -e

## batch run of one test in a particular file: see examples.sh
## starting with a completely clean database on the default port

## user the setup-and-start script to start with a clean database
## setup is 'lite' = clear all tables (except users and templates) in test databases
# scripts/testdb/setup-and-start-test-db.sh -c lite

export SKIP_DOI_TESTS='no'
export TEST_PATTERN="tests/mcapi/Database-Level/specs/dataset-doi-spec.js"
scripts/testdb/run-given-tests.sh

