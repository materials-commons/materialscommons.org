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

const datapath_prefix = '../../';
const db_model_base = '../../mcapi/db/model';
const dbModelUsers = require(db_model_base + '/users');
const commentsBackend = require(db_model_base + '/comments');
const projects = require(db_model_base + '/projects');

let random_name = function(name){
    let number = Math.floor(Math.random()*10000);
    return name + '-' + number;
};

let userId = "test@test.mc";
let user;
let otherUserIds = ["another@test.mc", "tadmin@test.mc"];

before(function*() {

    // this.timeout(8000); // this test suite can take up to 8 seconds

    user = yield dbModelUsers.getUser(userId);
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
            let users = ['weymouth@umich.edu','terry.weymouth@gmail.com'];
            let fakeItemId = random_name('fakeItem');
            let fakeItemType = 'fake';
            let baseText = "This is a fake comment on item = " + fakeItemId + " and type = " + fakeItemType;
            for (let i = 0; i < users.length; i++) {
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
                console.log("Did trigger, " + i + ", for item_id = " + fakeItemId + ", " + postUserId);
            }
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
    describe('comments by real authors on a real object: ', function () {
        it('is triggered by real authors', function* (){
            let users = ['weymouth@umich.edu','terry.weymouth@gmail.com',
                'terry.weymouth@gmail.com','weymouth.test@gmail.com',userId];
            let errorOrVal = yield projects.createProject(user,{
                name: random_name('Commented-Project'),
                description: "Project for testing comments."
            });
            assert.isOk(errorOrVal);
            assert.isOk(errorOrVal.val);
            let project = errorOrVal.val;
            let itemId = project.id;
            let itemType = project.otype;
            let textBase = "Auto-generated comment: ";
            let filler = "This is extra text to make a longer message.";
            for (let i = 0; i < 4; i++) {
                filler = [filler, filler].join(' ');
            }
            for (let i = 0; i < users.length; i++) {
                let postUserId = users[i];
                let commentText = textBase + i + ". " + filler;
                errorOrVal = yield commentsBackend.addComment(itemId, itemType, postUserId, commentText);
                assert.isOk(errorOrVal);
                assert.isOk(errorOrVal.val);
                let comment = errorOrVal.val;
                assert.isOk(comment.id);
                assert.equal(comment.otype, 'comment');
                assert.equal(comment.owner, postUserId);
                assert.equal(comment.item_id, itemId);
                assert.equal(comment.item_type, itemType);
                console.log("Did trigger, " + i + ", for item_id = " + itemId + ", " + postUserId);
            }
        });
    });
    describe('totally bogus test: ', function(){
        it('is a one shot by test@test.mc of comment into table', function* () {
            let users = ['another@test.mc','tadmin@test.mc',userId];
            let itemId = '14f57aed-0403-486c-b68a-0c7d88103fb2'; // hand picked dataset id
            let itemType = 'dataset';
            let textBase = "Auto-generated comment: ";
            let filler = "This is extra text to make a longer message.";
            for (let i = 0; i < 4; i++) {
                filler = [filler, filler].join(' ');
            }
            for (let i = 0; i < users.length; i++) {
                let postUserId = users[i];
                let commentText = textBase + i + ". " + filler;
                let errorOrVal = yield commentsBackend.addComment(itemId, itemType, postUserId, commentText);
                assert.isOk(errorOrVal);
                assert.isOk(errorOrVal.val);
                let comment = errorOrVal.val;
                assert.isOk(comment.id);
                assert.equal(comment.otype, 'comment');
                assert.equal(comment.owner, postUserId);
                assert.equal(comment.item_id, itemId);
                assert.equal(comment.item_type, itemType);
                console.log("Did trigger, " + i + ", for item_id = " + itemId + ", " + postUserId);
            }
        });
    });
});

