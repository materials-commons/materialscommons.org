'use strict';

require('mocha');
require('co-mocha');
const chai = require('chai');
const assert = require('chai').assert;

console.log('MCDB', process.env.MCDB);
console.log('MCDB_PORT', process.env.MCDB_PORT);

const r = require('rethinkdbdash')({
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815
});

const backend_base = '../../../..';
const dbModelUsers = require(backend_base + '/servers/mcapi/db/model/users');
const experimentDatasets = require(backend_base + '/servers/mcapi/db/model/experiment-datasets');
const comments = require(backend_base + '/servers/mcapi/db/model/comments');

const testHelpers = require('./test-helpers');

const userId = "test@test.mc";
const anotherUserId = "another@test.mc";
const yetAnotherUserId = "tadmin@test.mc";

let project = null;
let experiment = null;
let dataset = null;
let user = null;

before(function*() {
    console.log("before comments-spec");
    this.timeout(80000); // setup may take up to 8 seconds
    user = yield dbModelUsers.getUser(userId);
    assert.isOk(user,"No test user available = " + userId);
    let another = yield dbModelUsers.getUser(anotherUserId);
    assert.isOk(another,"No test user available = " + anotherUserId);
    yield createRenamedDemoProjectWithPublishedDataset();
    console.log("done before comments-spec");
});

describe('Feature - comments: ', function() {
    console.log('Feature - comments');
    describe('Create comment', function() {
        it ('add a new comment by the test user', function*(){
            let owner = userId;
            let attributes = {
                item_id: dataset.id,
                item_type: dataset.otype,
                text: "First comment - by owner of dataset"
            }
            let results = yield comments.addComment(owner, attributes);
            assert.isOk(results);
            assert.isOk(results.val);
            let comment = results.val;
            assert.equal(comment.otype, "comment");
            assert.equal(comment.item_id, attributes.item_id);
            assert.equal(comment.item_type, attributes.item_type);
            assert.equal(comment.text, attributes.text);
            assert.equal(comment.owner, userId);
        });
        it ('add a new comment by a another user', function*(){
            let owner = anotherUserId;
            let attributes = {
                item_id: dataset.id,
                item_type: dataset.otype,
                text: "Another comment - by another user"
            }
            let results = yield comments.addComment(owner, attributes);
            assert.isOk(results);
            assert.isOk(results.val);
            let comment = results.val;
            assert.equal(comment.otype, "comment");
            assert.equal(comment.item_id, attributes.item_id);
            assert.equal(comment.item_type, attributes.item_type);
            assert.equal(comment.text, attributes.text);
            assert.equal(comment.owner, anotherUserId);
        });
        it ('add a new comment by a yet another user', function*(){
            let owner = yetAnotherUserId;
            let attributes = {
                item_id: dataset.id,
                item_type: dataset.otype,
                text: "Another comment - by yet another user"
            }
            let results = yield comments.addComment(owner, attributes);
            assert.isOk(results);
            assert.isOk(results.val);
            let comment = results.val;
            assert.equal(comment.otype, "comment");
            assert.equal(comment.item_id, attributes.item_id);
            assert.equal(comment.item_type, attributes.item_type);
            assert.equal(comment.text, attributes.text);
            assert.equal(comment.owner, yetAnotherUserId);
        });
    });
    describe('Update comment', function() {
        it ('add and update a comment', function*(){
            let owner = userId;
            let starting_text = "Comment for update - by owner of dataset";
            let updated_text = "Updated text for comment - by owner of dataset";
            let attributes = {
                item_id: dataset.id,
                item_type: dataset.otype,
                text: starting_text
            }
            let results = yield comments.addComment(owner, attributes);
            assert.isOk(results);
            assert.isOk(results.val);
            let comment = results.val;
            assert.equal(comment.otype, "comment");
            assert.equal(comment.item_id, attributes.item_id);
            assert.equal(comment.item_type, attributes.item_type);
            assert.equal(comment.text, starting_text);
            assert.equal(comment.owner, userId);
            let update_attributes = {
                text: updated_text
            }
            results = yield comments.updateComment(comment.id, update_attributes);
            assert.isOk(results);
            assert.isOk(results.val);
            let updated_comment = results.val;
            assert.equal(updated_comment.id, comment.id);
            assert.equal(updated_comment.otype, "comment");
            assert.equal(updated_comment.item_id, attributes.item_id);
            assert.equal(updated_comment.item_type, attributes.item_type);
            assert.equal(updated_comment.text, updated_text);
            assert.equal(updated_comment.owner, userId);
        });
    });
    describe('Delete comment', function() {
        it ('add and delete a comment', function*(){
            let owner = userId;
            let attributes = {
                item_id: dataset.id,
                item_type: dataset.otype,
                text: "Comment for deleting"
            }
            let results = yield comments.addComment(owner, attributes);
            assert.isOk(results);
            assert.isOk(results.val);
            let comment = results.val;
            assert.equal(comment.otype, "comment");
            assert.equal(comment.item_id, attributes.item_id);
            assert.equal(comment.item_type, attributes.item_type);
            assert.equal(comment.text, attributes.text);
            assert.equal(comment.owner, userId);
            results = yield comments.deleteComment(comment.id)
            assert.isOk(results);
            assert.isOk(results.deleted);
            assert.equal(results.deleted, comment.id);
        });
    });
});

function* createRenamedDemoProjectWithPublishedDataset() {
    // create a renamed demo project for testing
    let valOrError = yield testHelpers.createDemoTestProject(user);
    let results = valOrError.val;
    project = results.project;
    experiment = results.experiment;

    // get process list for dataset
    let processList = results.processList;
    let processIdList = [];
    processList.forEach((process) => {
        processIdList.push(process.id);
    });

    // create a published dataset
    let datasetList = yield testHelpers.createDatasetList(experiment, processList, userId);
    dataset = datasetList[0];
    let datasetId = dataset.id;
    results = yield experimentDatasets.publishDataset(datasetId);
    dataset = results.val;
}
