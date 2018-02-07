'use strict';
require('mocha');
require('co-mocha');
const chai = require('chai');
const assert = require('chai').assert;

const r = require('rethinkdbdash')({
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815
});

const backend_base = '../../../..';
const etl_metadata = require(backend_base + '/servers/mcapi/db/model/experiments-etl-metadata');

let userId = "test@test.mc";

before(function*() {
    let user = yield dbModelUsers.getUser(userId);
    assert.isOk(user,"No test user available = " + userId);
});

let test_metadata = {
  "time_stamp": "Wed Feb  7 11:50:07 2018",
  "process_metadata": [
    {
      "id": "7dd5f27f-2a56-49f0-9803-a0ec6c714a2b",
      "name": "Create Samples",
      "template": "global_Create Samples",
      "start_row": 5,
      "end_row": 6,
      "start_col": 1,
      "end_col": 2
    },
    {
      "id": "d8e7a9f3-4e07-49df-b9df-d4d4da0c2eb4",
      "name": "Preperation 1",
      "template": "global_Heat Treatment",
      "start_row": 5,
      "end_row": 6,
      "start_col": 2,
      "end_col": 5
    }
  ],
  "input_excel_file_path": "/Users/weymouth/Desktop/test/short.xlsx",
  "input_data_dir_path": "/Users/weymouth/Desktop/test/data",
  "output_json_file_path": "/Users/weymouth/Desktop/test/metadata.json",
  "project_id": "4c111db1-62f2-4fd9-a8ca-6d17067c66b1",
  "experiment_id": "93a3f92f-0519-4995-86b8-652831c55161",
  "header_row_end": 5,
  "data_row_start": 5,
  "data_row_end": 9,
  "data_col_start": 1,
  "data_col_end": 5,
  "start_attribute_row": 1,
  "sheet_headers": [
    [
      "PROJ: Generic Testing",
      "PROC: Create Samples",
      "PROC: Heat Treatment",
      null,
      null
    ],
    [
      "EXP: Test1",
      "SAMPLES",
      "PARAM",
      "PARAM",
      "FILES"
    ],
    [
      null,
      null,
      "Temperature (C)",
      "Time (h)",
      null
    ],
    [
      "NAME",
      null,
      "Preperation 1",
      null,
      null
    ],
    [
      "LABEL",
      "Sample Name",
      "Temp (\u00baC)",
      "Time (hr)",
      null
    ]
  ],
};

describe('ETL experiment metadata: ', function() {
    it('can create, get by id', function* () {

    });
    it('can create, get by experiment id,', function* () {

    });
    it('can create, update', function* () {

    });
    it('can create, delete', function* () {

    });
});
