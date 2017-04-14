'use strict';
require('mocha');
import {it} from 'mocha';
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
const samples = require(backend_base + '/samples');

const testHelpers = require('./test-helpers');

const experimentDelete = require(backend_base + '/experiment-delete');

const base_project_name = "Test directory";

let random_name = function () {
    let number = Math.floor(Math.random() * 10000);
    return base_project_name + number;
};

let userId = "test@test.mc";

let project = null;
let experiment = null;
let processList = null;
let sampleList = null;
let fileList = null;
let datasetList = null;
let experimentNote = null;
let experimentTask = null;
let reviews_count = 0;
let notes_count = 0;

beforeEach(function*() {

    this.timeout(8000); // tests in this test suite can take up to 8 seconds

    let user = yield dbModelUsers.getUser(userId);
    assert.isOk(user, "No test user available = " + userId);
    assert.equal(userId, user.id);

    let valOrError = yield testHelpers.createDemoTestProject(user);
    assert.isUndefined(valOrError.error, "Unexpected error from createDemoProjectForUser: " + valOrError.error);
    let results = valOrError.val;
    project = results.project;
    experiment = results.experiment;
    processList = results.processList;
    sampleList = results.sampleList;
    fileList = results.fileList;

    assert.equal(project.otype, "project");
    assert.equal(project.owner, userId);

    datasetList = yield testHelpers.createDatasetList(experiment, processList, userId);

    // Note: create fake sample that is not part of a process for testing
    results = yield r.table('samples').insert({'name': 'fake sample', 'otype': 'sample', 'owner': 'noone'});
    let key = results.generated_keys[0];
    yield r.table('experiment2sample').insert({sample_id: key, experiment_id: experiment.id});

    experimentNote = yield testHelpers.setUpFakeExperimentNoteData(experiment.id, userId);
    experimentTask = yield testHelpers.setUpAdditionalExperimentTaskData(experiment.id, userId);

    yield setUpFakeNotesAndReviews();

});

describe('Feature - Experiments: ', function () {
    describe('Delete Experiment - simple case: ', function () {
        it('does not delete an experiment with a published dataset', function*() {
            let project_id = project.id;
            assert.isOk(project_id);
            let experiment_id = experiment.id;
            assert.isOk(experiment_id);

            let idList = [];
            for (let i = 0; i < datasetList.length; i++) {
                idList.push(datasetList[i].id);
            }

            yield testDatasets({assertExists: true});

            // publish one of the datasets
            let datasetId = idList[0];
            let results = yield experimentDatasets.publishDataset(datasetId);
            assert.isOk(results);
            assert.isOk(results.val);
            assert.isOk(results.val.published);
            assert(results.val.published);

            // delete experiment - fails
            results = yield experimentDelete.deleteExperiment(project_id, experiment_id);
            assert.isOk(results);
            assert.isOk(results.error);

            yield testDatasets({assertExists: true});

        });
        it('deletes all datasets, processes, samples, tasks, and links to files', function*() {
            let project_id = project.id;
            assert.isOk(project_id);
            let experiment_id = experiment.id;
            assert.isOk(experiment_id);

            yield testDatasets({assertExists: true});

            yield testBestMearureHistroy({assertExists: true});

            yield testProcessesSamples({assertExists: true});

            yield testExperimentNotes({assertExists: true});

            yield testExperimentTasks({assertExists: true});

            yield testFileLinks({assertExists: true});

            yield testNotesAndReviews({assertExists: true});

            // delete experiment
            let results = yield experimentDelete
                .deleteExperiment(project_id, experiment_id, {deleteProcesses: true, dryRun: false});
            assert.isOk(results);
            assert.isOk(results.val);
            assert.isOk(results.val.datasets);
            assert.equal(results.val.datasets.length, 2);
            assert.isOk(results.val.best_measure_history);
            assert.equal(results.val.best_measure_history.length, 1);
            assert.isOk(results.val.processes);
            assert.equal(results.val.processes.length, 5);
            assert.isOk(results.val.samples);
            assert.equal(results.val.samples.length, 8);
            assert.isOk(results.val.experiment_notes);
            assert.equal(results.val.experiment_notes.length, 1);
            assert.isOk(results.val.experiment_tasks);
            assert.equal(results.val.experiment_tasks.length, 1);
            assert.isOk(results.val.experiment_task_processes);
            assert.equal(results.val.experiment_task_processes.length, 1);
            assert.isOk(results.val.reviews);
            assert.equal(results.val.reviews.length, 1);
            assert.isOk(results.val.notes);
            assert.equal(results.val.notes.length, 1);

            yield testDatasets({assertExists: false});

            yield testBestMearureHistroy({assertExists: false});

            yield testProcessesSamples({assertExists: false});

            yield testExperimentNotes({assertExists: false});

            yield testExperimentTasks({assertExists: false});

            yield testFileLinks({assertExists: false});

            yield testNotesAndReviews({assertExists: false});

        });
    });
});

function* testDatasets(options) {

    let count = 0;
    if (options && options.assertExists) {
        count = 2;
    }

    let idList = [];
    for (let i = 0; i < datasetList.length; i++) {
        idList.push(datasetList[i].id);
    }

    let check = yield experimentDatasets.getDatasetsForExperiment(experiment.id);
    let dataset_list = check.val;
    assert.isOk(dataset_list);
    assert.equal(dataset_list.length, count);

    check = yield r.table('dataset2process').getAll(r.args([...idList]), {index: 'dataset_id'});
    assert.isOk(check);
    assert.equal(check.length, count);

    check = yield r.table('experiment2dataset').getAll(r.args([...idList]), {index: 'dataset_id'});
    assert.isOk(check);
    assert.equal(check.length, count);
}

function* testBestMearureHistroy(options) {

    let count = 0;
    if (options && options.assertExists) {
        count = 1;
    }

    let idList = yield r.table('experiment2sample')
        .getAll(experiment.id, {index: 'experiment_id'})
        .eqJoin('sample_id', r.table('samples')).zip()
        .eqJoin('sample_id', r.table('sample2propertyset'), {index: 'sample_id'}).zip()
        .eqJoin('property_set_id', r.table('propertysets')).zip()
        .eqJoin('property_set_id', r.table('propertyset2property'), {index: 'property_set_id'}).zip()
        .eqJoin('property_id', r.table('properties')).zip()
        .eqJoin('property_id', r.table('best_measure_history'), {index: 'property_id'}).zip()
        .getField('property_id');

    assert.isOk(idList);
    assert.equal(idList.length, count);
}

function* testProcessesSamples(options) {

    let processCount = 0;
    let sampleCount = 0;
    if (options && options.assertExists) {
        processCount = 5;
        sampleCount = 8;
    }
    let sampleList = yield r.db('materialscommons').table('experiment2sample')
        .getAll(experiment.id, {index: 'experiment_id'})
        .eqJoin('sample_id', r.db('materialscommons').table('samples')).zip()
        .getField('sample_id');
    assert.isOk(sampleList);
    assert.equal(sampleList.length, sampleCount);

    let simple = true;
    let results = yield experiments.getProcessesForExperiment(experiment.id, simple);
    assert.isOk(results);
    assert.isOk(results.val);
    let procList = results.val;
    assert.equal(procList.length, processCount);

}

function* testExperimentNotes(options) {

    let count = 0;
    if (options && options.assertExists) {
        count = 1;
    }

    let results = yield r.table('experiment2experimentnote')
        .getAll(experiment.id, {index: 'experiment_id'});
    assert.isOk(results);
    assert.equal(results.length, count);

    results = yield r.table('experimentnotes').get(experimentNote.id);
    if (count === 1) {
        assert.isOk(results);
        assert.equal(results.otype, 'experimentnote');
    } else {
        assert.isNull(results);
    }

    results = yield r.table('experiment2experimentnote')
        .getAll(experiment.id, {index: 'experiment_id'});

    assert.equal(results.length, count);

}

function* testExperimentTasks(options) {

    let count = 0;
    if (options && options.assertExists) {
        count = 1;
    }

    let taskId = experimentTask.id;
    let processId = experimentTask.process_id;

    let idList = yield r.table('experiment2experimenttask')
        .getAll(experiment.id, {index: 'experiment_id'});
    assert.isOk(idList);
    assert.equal(idList.length, count);

    idList = yield r.table('experimenttask2process')
        .getAll(taskId, {index: 'experiment_task_id'});
    assert.isOk(idList);
    assert.equal(idList.length, count);

    idList = yield r.table('experimenttask2process')
        .getAll(taskId, {index: 'experiment_task_id'});
    assert.isOk(idList);
    assert.equal(idList.length, count);

    idList = yield r.table('experimenttasks')
        .getAll(taskId);
    assert.isOk(idList);
    assert.equal(idList.length, count);

}

function* testFileLinks(options){
    let count = 0;
    if (options && options.assertExists) {
        count = 16;
    }

    let idList = [];
    for (let i = 0; i < fileList.length; i++) {
        idList.push(fileList[i].id);
    }

    let linkList = yield r.table('experiment2datafile').getAll(r.args(idList),{index: 'datafile_id'});

    assert.isOk(linkList);
    assert.equal(linkList.length, count);

}

function* testNotesAndReviews(options){

    let counts = [0, 0, 0, 0];
    if (options && options.assertExists) {
        counts = [1, 1, notes_count, reviews_count];
    }

    let countOfNotes = counts[0];
    let countOfReviews = counts[1];
    let countOfNoteItems = counts[2];
    let countOfReviewItems = counts[3];

    let id_list = [];

    for (let i = 0; i < processList.length; i++) {
        id_list.push(processList[i].id);
    }

    for (let i = 0; i < sampleList.length; i++) {
        id_list.push(sampleList[i].id);
    }

    for (let i = 0; i < fileList.length; i++) {
        id_list.push(fileList[i].id);
    }

    let entities = yield r.table('note2item').getAll(r.args(id_list),{index: 'item_id'});

    assert.equal(entities.length, countOfNoteItems);

    let noteIdSet = new Set();
    for (let i = 0; i < entities.length; i++){
        noteIdSet = noteIdSet.add(entities[i].note_id);
    }

    assert.equal(noteIdSet.size, countOfNotes);

    entities = yield r.table('review2item').getAll(r.args(id_list),{index: 'item_id'});

    assert.equal(entities.length, countOfReviewItems);

    let reviewIdSet = new Set();
    for (let i = 0; i < entities.length; i++){
        reviewIdSet = reviewIdSet.add(entities[i].review_id);
    }

    assert.equal(reviewIdSet.size, countOfReviews);

}

function* setUpFakeNotesAndReviews() {
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
    for (let i = 0; i < processList.length; i++) {
        let note2item = {
            item_id: processList[i].id,
            item_type: 'process',
            note_id: noteId
        };
        entities.push(note2item);
    }

    for (let i = 0; i < sampleList.length; i++) {
        let note2item = {
            item_id: sampleList[i].id,
            item_type: 'sample',
            note_id: noteId
        };
        entities.push(note2item);
    }

    for (let i = 0; i < fileList.length; i++) {
        let note2item = {
            item_id: fileList[i].id,
            item_type: 'files',
            note_id: noteId
        };
        entities.push(note2item);
    }

    insert_msg = yield r.table('note2item').insert(entities);

    assert.equal(insert_msg.generated_keys.length,entities.length);

    notes_count = entities.length;

    entities = [];
    for (let i = 0; i < processList.length; i++) {
        let review2item = {
            item_id: processList[i].id,
            item_type: 'process',
            review_id: reviewId
        };
        entities.push(review2item);
    }

    for (let i = 0; i < sampleList.length; i++) {
        let review2item = {
            item_id: sampleList[i].id,
            item_type: 'sample',
            review_id: reviewId
        };
        entities.push(review2item);
    }

    for (let i = 0; i < fileList.length; i++) {
        let review2item = {
            item_id: fileList[i].id,
            item_type: 'files',
            review_id: reviewId
        };
        entities.push(review2item);
    }

    insert_msg = yield r.table('review2item').insert(entities);

    assert.equal(insert_msg.generated_keys.length,entities.length);

    reviews_count = entities.length;

    yield testNotesAndReviews({assertExists: true});

}