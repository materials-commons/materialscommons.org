'use strict';
require('mocha');
const it = require('mocha').it;
require('co-mocha');
const _ = require('lodash');
const chai = require('chai');
const assert = chai.assert;
const should = chai.should();

const r = require('rethinkdbdash')({
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815
});

const datapath_prefix = '../../'
const backend_base = '../../..';
const mcapi_base = backend_base + '/servers/mcapi';

const db_model_base = mcapi_base + '/db/model';
const dbModelUsers = require(db_model_base + '/users');
//const projects = require(db_model_base + '/projects');
//const experimentDatasets = require(db_model_base + '/experiment-datasets');
const commentsBackend = require(db_model_base + '/comments');

//const build_project_base = mcapi_base + "/build-demo";
//const demoProjectConf = require(build_project_base + '/build-demo-project-conf');
//const buildDemoProject = require(build_project_base + '/build-demo-project');

//demoProjectConf.datapathPrefix = datapath_prefix;

let random_name = function(name){
    let number = Math.floor(Math.random()*10000);
    return name + '-' + number;
};

let userId = "test@test.mc";
let otherUserIds = ["another@test.mc", "tadmin@test.mc"];

before(function*() {

    // this.timeout(8000); // this test suite can take up to 8 seconds

    let user = yield dbModelUsers.getUser(userId);
    assert.isOk(user, "No test user available = " + userId);
    assert.equal(userId,user.id);
});

describe('Feature - Monitoring comments table: ', function() {
    describe('new comment on new object raw: ', function () {
        it('is triggered by new comment', function* (){
            let fakeItemId = random_name('fakeItem');
            let fakeItemType = 'fake';
            let comment = {
                item_id: fakeItemId,
                item_type: fakeItemType,
                owner: userId,
                text: "This is a fake comment on item = " + fakeItemId + " and type = " + fakeItemType,
                otype: "comment"
            };
            console.log("Verify insert on watcher!");
            console.log(comment);
            yield r.table('comments').insert(comment);
        });
        it('is triggered by multiple comments', function* (){
            let fakeItemId = random_name('fakeItem');
            let fakeItemType = 'fake';
            let comment = {
                item_id: fakeItemId,
                item_type: fakeItemType,
                owner: userId,
                text: "This is a fake comment on item = " + fakeItemId + " and type = " + fakeItemType,
                otype: "comment"
            };
            console.log("Verify insert on watcher!");
            let original = comment.text;
            for (let i = 0; i < 3; i++) {
                let tag = " instance " + i;
                comment.text = original + tag;
                console.log(comment);
                yield r.table('comments').insert(comment);
            }
        });
    });
    describe('new comment on new object - via backend: ', function () {
        it('is triggered by new comment', function* (){
            let fakeItemId = random_name('fakeItem');
            let fakeItemType = 'fake';
            let commentText = "This is a fake comment on item = " + fakeItemId + " and type = " + fakeItemType;
            let errorOrVal = yield commentsBackend.addComment(fakeItemId, fakeItemType, userId, commentText);
            assert.isOk(errorOrVal);
            assert.isOk(errorOrVal.val);
            let comment = errorOrVal.val;
            assert.isOk(comment.id);
            assert.equal(comment.otype, 'comment');
            assert.equal(comment.item_id, fakeItemId);
            assert.equal(comment.item_type, fakeItemType);
            console.log("Did trigger for item_id = " + fakeItemId);
        });
        it('is triggered by multiple comments', function* (){
            let fakeItemId = random_name('fakeItem');
            let fakeItemType = 'fake';
            let baseText = "This is a fake comment on item = " + fakeItemId + " and type = " + fakeItemType;
            for (let i = 0; i < 3; i++) {
                let tag = " instance " + i;
                let commentText = baseText + tag;
                let errorOrVal = yield commentsBackend.addComment(fakeItemId, fakeItemType, userId, commentText);
                assert.isOk(errorOrVal);
                assert.isOk(errorOrVal.val);
                let comment = errorOrVal.val;
                assert.isOk(comment.id);
                assert.equal(comment.otype, 'comment');
                assert.equal(comment.item_id, fakeItemId);
                assert.equal(comment.item_type, fakeItemType);
                console.log("Did trigger for item_id = " + fakeItemId);
            }
        });
    });
    describe('comments by multiple authors: ', function () {
        it('is triggered by two authors', function* (){
            for (let i = 0; i < otherUserIds.length; i++) {
                let userId = otherUserIds[i];
                let user = yield dbModelUsers.getUser(userId);
                assert.isOk(user, "No test user available = " + userId);
                assert.equal(userId,user.id);
            }
            let users = [userId].concat(otherUserIds);
            let fakeItemId = random_name('fakeItem');
            let fakeItemType = 'fake';
            let baseText = "This is a fake comment on item = " + fakeItemId + " and type = " + fakeItemType;
            for (let i = 0; i < 2; i++) {
                let postUserId = users[i];
                let tag = " instance " + i + " user " + postUserId;
                let commentText = baseText + tag;
                let errorOrVal = yield commentsBackend.addComment(fakeItemId, fakeItemType, postUserId, commentText);
                assert.isOk(errorOrVal);
                assert.isOk(errorOrVal.val);
                let comment = errorOrVal.val;
                assert.isOk(comment.id);
                assert.equal(comment.otype, 'comment');
                assert.equal(comment.owner, postUserId);
                assert.equal(comment.item_id, fakeItemId);
                assert.equal(comment.item_type, fakeItemType);
                console.log("Did trigger, " + i + ", for item_id = " + fakeItemId);
            }
            let checks = yield r.table('comments').getAll(fakeItemId,{index: 'item_id'});
            console.log(checks);
        });
        it('is triggered by multiple comments', function* (){
            for (let i = 0; i < otherUserIds.length; i++) {
                let userId = otherUserIds[i];
                let user = yield dbModelUsers.getUser(userId);
                assert.isOk(user, "No test user available = " + userId);
                assert.equal(userId,user.id);
            }
            let users = [userId].concat(otherUserIds);
            let fakeItemId = random_name('fakeItem');
            let fakeItemType = 'fake';
            let baseText = "This is a fake comment on item = " + fakeItemId + " and type = " + fakeItemType;
            for (let i = 0; i < users.length; i++) {
                let postUserId = users[i];
                for (let i = 0; i < 3; i++) {
                    let tag = " instance " + i + " user " + postUserId;
                    let commentText = baseText + tag;
                    let errorOrVal = yield commentsBackend.addComment(fakeItemId, fakeItemType, postUserId, commentText);
                    assert.isOk(errorOrVal);
                    assert.isOk(errorOrVal.val);
                    let comment = errorOrVal.val;
                    assert.isOk(comment.id);
                    assert.equal(comment.otype, 'comment');
                    assert.equal(comment.owner, postUserId);
                    assert.equal(comment.item_id, fakeItemId);
                    assert.equal(comment.item_type, fakeItemType);
                    console.log("Did trigger for item_id = " + fakeItemId);
                }
            }
        });
    });
});

