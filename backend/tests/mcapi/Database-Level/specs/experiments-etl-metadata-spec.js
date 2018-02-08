'use strict';
require('mocha');
require('co-mocha');
const chai = require('chai');
const assert = require('chai').assert;

const backend_base = '../../../..';
const dbModelUsers = require(backend_base + '/servers/mcapi/db/model/users');
const etl_metadata = require(backend_base + '/servers/mcapi/db/model/experiments-etl-metadata');

const userId = "test@test.mc";
const fake_experiment_id = "this_is_a_test";

let random_fake_id = function(){
    let number = Math.floor(Math.random()*10000);
    return fake_experiment_id + number;
};

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

let test_update_metadata = {
  "time_stamp": "Wed Feb  7 16:11:23 EST 2018",
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
        let fake_exp_id = random_fake_id();
        let error_or_data = yield etl_metadata.create(userId, fake_exp_id, test_metadata);
        assert.isOk(error_or_data);
        let results = error_or_data.data;
        assert.isOk(results, error_or_data);
        assert.equal(fake_exp_id, results.experiment_id);
        assert.equal(userId, results.owner);
        assert.deepEqual(results.json, test_metadata);
        assert.isOk(results.id);

        let metadata_id = results.id;
        error_or_data = yield etl_metadata.get(metadata_id);
        assert.isOk(error_or_data);
        results = error_or_data.data;
        assert.isOk(results, error_or_data);
        assert.equal(fake_exp_id, results.experiment_id);
        assert.equal(userId, results.owner);
        assert.deepEqual(results.json, test_metadata);
        assert.isOk(results.id);
        assert.equal(results.id, metadata_id);

    });
    it('can create, get by experiment id,', function* () {
        let fake_exp_id = random_fake_id();
        let error_or_data = yield etl_metadata.create(userId, fake_exp_id, test_metadata);
        assert.isOk(error_or_data);
        let results = error_or_data.data;
        assert.isOk(results, error_or_data);
        assert.equal(fake_exp_id, results.experiment_id);
        assert.equal(userId, results.owner);
        assert.deepEqual(results.json, test_metadata);
        assert.isOk(results.id);
        let metadata_id = results.id;

        error_or_data = yield etl_metadata.getByExperimentId(fake_exp_id);
        assert.isOk(error_or_data);
        results = error_or_data.data;
        assert.isOk(results, error_or_data);
        assert.equal(fake_exp_id, results.experiment_id);
        assert.equal(userId, results.owner);
        assert.deepEqual(results.json, test_metadata);
        assert.isOk(results.id);
        assert.equal(results.id, metadata_id);
    });
    it('can create, update', function* () {
        let fake_exp_id = random_fake_id();
        let error_or_data = yield etl_metadata.create(userId, fake_exp_id, test_metadata);
        assert.isOk(error_or_data);
        let results = error_or_data.data;
        assert.isOk(results, error_or_data);
        assert.equal(fake_exp_id, results.experiment_id);
        assert.equal(userId, results.owner);
        assert.deepEqual(results.json, test_metadata);
        assert.isOk(results.id);
        let metadata_id = results.id;

        error_or_data = yield etl_metadata.update(metadata_id, test_update_metadata);
        assert.isOk(error_or_data);
        results = error_or_data.data;
        assert.isOk(results, error_or_data);
        assert.equal(fake_exp_id, results.experiment_id);
        assert.equal(userId, results.owner);
        assert.notDeepEqual(results.json, test_metadata);
        assert.deepEqual(results.json,test_update_metadata, test_update_metadata);
        assert.isOk(results.id);
        assert.equal(results.id, metadata_id);
    });
    it('can create, delete', function* () {
        let fake_exp_id = random_fake_id();
        let error_or_data = yield etl_metadata.create(userId, fake_exp_id, test_metadata);
        assert.isOk(error_or_data);
        let results = error_or_data.data;
        assert.isOk(results, error_or_data);
        assert.equal(fake_exp_id, results.experiment_id);
        assert.equal(userId, results.owner);
        assert.deepEqual(results.json, test_metadata);
        assert.isOk(results.id);

        let metadata_id = results.id;
        let deleted_flag = yield etl_metadata.remove(metadata_id);
        assert.isOk(deleted_flag);

        error_or_data = yield etl_metadata.get(metadata_id);
        assert.isOk(error_or_data);
        assert.isOk(error_or_data.error);

    });
});
