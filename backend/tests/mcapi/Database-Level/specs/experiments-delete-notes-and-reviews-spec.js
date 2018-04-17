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
const mcapi_base = '../../../../servers/mcapi';
const backend_base = mcapi_base + "/db/model";
const build_project_base = mcapi_base + "/build-demo";

const dbModelUsers = require(backend_base + '/users');
const projects = require(backend_base + '/projects');
const directories = require(backend_base + '/directories');
const experiments = require(backend_base + '/experiments');
const processes = require(backend_base + '/processes');
const experimentDatasets = require(backend_base + '/experiment-datasets');

const helper = require(build_project_base + '/build-demo-project-helper');
const demoProjectConf = require(build_project_base + '/build-demo-project-conf');
const buildDemoProject = require(build_project_base + '/build-demo-project');

const base_project_name = "Test directory";

let random_name = function () {
    let number = Math.floor(Math.random() * 10000);
    return base_project_name + number;
};

let userId = "test@test.mc";

let project = null;
let experiment = null;
let process_list = null;
let sample_list = null;
let file_list = null;
let notes_count = 0;
let reviews_count = 0;

before(function* () {
    console.log('before experiments-delete-notes-and-reviews-spec.js');
    this.timeout(80000); // this test suite can take up to 8 seconds

    let user = yield dbModelUsers.getUser(userId);
    assert.isOk(user, "No test user available = " + userId);
    assert.equal(userId, user.id);

//    let valOrError = yield buildDemoProject.findOrBuildAllParts(user, demoProjectConf.datapathPrefix);
    let valOrError = yield buildDemoProject.findOrBuildAllParts(user, process.cwd() + '/');
    assert.isUndefined(valOrError.error, "Unexpected error from createDemoProjectForUser: " + valOrError.error);
    let results = valOrError.val;
    project = results.project;
    experiment = results.experiment;
    process_list = results.processes;
    sample_list = results.samples;
    file_list = results.files;

    let project_id = project.id;
    let experiment_id = experiment.id;

    let name = random_name();
    let description = "Changed the name of the demo project to " + name;
    let updateData = {
        name: name,
        description: description
    };
    let updated_project = yield projects.update(project.id, updateData);
    assert.equal(updated_project.otype, "project");
    assert.equal(updated_project.owner, userId);
    assert.equal(updated_project.name, name);
    assert.equal(updated_project.description, description);
    assert.equal(updated_project.id, project_id);
    project = updated_project;

    // set up fake note data
    let fake_note_entry = {
        title: "Fake note/review entry for testing",
        note: "Test of fake node/review",
        owner: project.owner,
        projectId: project.id,
    };

    let insert_msg = yield r.table('notes').insert(fake_note_entry);
    let noteId = insert_msg.generated_keys[0];

    // set up fake review data
    let fake_review_entry = {
        title: "Fake note/review entry for testing",
        review: "Test of fake node/review",
        owner: project.owner,
        projectId: project.id,
    };

    insert_msg = yield r.table('reviews').insert(fake_review_entry);
    let reviewId = insert_msg.generated_keys[0];

    let entities = [];
    for (let i = 0; i < process_list.length; i++) {
        let note2item = {
            item_id: process_list[i].id,
            item_type: 'process',
            note_id: noteId
        };
        entities.push(note2item);
    }

    for (let i = 0; i < sample_list.length; i++) {
        let note2item = {
            item_id: sample_list[i].id,
            item_type: 'sample',
            note_id: noteId
        };
        entities.push(note2item);
    }

    for (let i = 0; i < file_list.length; i++) {
        let note2item = {
            item_id: file_list[i].id,
            item_type: 'files',
            note_id: noteId
        };
        entities.push(note2item);
    }

    insert_msg = yield r.table('note2item').insert(entities);

    assert.equal(insert_msg.generated_keys.length, entities.length);

    notes_count = entities.length;

    entities = [];
    for (let i = 0; i < process_list.length; i++) {
        let review2item = {
            item_id: process_list[i].id,
            item_type: 'process',
            review_id: reviewId
        };
        entities.push(review2item);
    }

    for (let i = 0; i < sample_list.length; i++) {
        let review2item = {
            item_id: sample_list[i].id,
            item_type: 'sample',
            review_id: reviewId
        };
        entities.push(review2item);
    }

    for (let i = 0; i < file_list.length; i++) {
        let review2item = {
            item_id: file_list[i].id,
            item_type: 'files',
            review_id: reviewId
        };
        entities.push(review2item);
    }

    insert_msg = yield r.table('review2item').insert(entities);

    assert.equal(insert_msg.generated_keys.length, entities.length);

    reviews_count = entities.length;
    console.log('done before experiments-delete-notes-and-reviews-spec.js');
});

describe('Feature - Experiments: ', function () {
    describe('Delete Experiment - in parts: ', function () {
        it('deletes items in notes', function* () {
            let id_list = [];

            for (let i = 0; i < process_list.length; i++) {
                id_list.push(process_list[i].id);
            }

            for (let i = 0; i < sample_list.length; i++) {
                id_list.push(sample_list[i].id);
            }

            for (let i = 0; i < file_list.length; i++) {
                id_list.push(file_list[i].id);
            }

            let entities = yield r.table('note2item').getAll(r.args(id_list), {index: 'item_id'});

            assert.equal(entities.length, notes_count);

            let noteIdSet = new Set();
            for (let i = 0; i < entities.length; i++) {
                noteIdSet = noteIdSet.add(entities[i].note_id);
            }

            assert.equal(noteIdSet.size, 1);

            let delete_msg = yield r.table('note2item').getAll(r.args(id_list), {index: 'item_id'}).delete();
            assert.equal(delete_msg.deleted, notes_count);

            delete_msg = yield r.table('notes').getAll(r.args([...noteIdSet])).delete();
            assert.equal(delete_msg.deleted, 1);

        });
        it('deletes items in reviews', function* () {
            let id_list = [];

            for (let i = 0; i < process_list.length; i++) {
                id_list.push(process_list[i].id);
            }

            for (let i = 0; i < sample_list.length; i++) {
                id_list.push(sample_list[i].id);
            }

            for (let i = 0; i < file_list.length; i++) {
                id_list.push(file_list[i].id);
            }

            let entities = yield r.table('review2item').getAll(r.args(id_list), {index: 'item_id'});

            assert.equal(entities.length, reviews_count);

            let reviewIdSet = new Set();
            for (let i = 0; i < entities.length; i++) {
                reviewIdSet = reviewIdSet.add(entities[i].review_id);
            }

            assert.equal(reviewIdSet.size, 1);

            let delete_msg = yield r.table('review2item').getAll(r.args(id_list), {index: 'item_id'}).delete();
            assert.equal(delete_msg.deleted, reviews_count);

            delete_msg = yield r.table('reviews').getAll(r.args([...reviewIdSet])).delete();
            assert.equal(delete_msg.deleted, 1);

        });
    });
});
