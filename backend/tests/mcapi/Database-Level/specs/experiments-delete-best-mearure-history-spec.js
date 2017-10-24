'use strict';
require('mocha');
require('mocha').it;
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

const testHelpers = require('./test-helpers');

const base_project_name = "Test directory";

let random_name = function(){
    let number = Math.floor(Math.random()*10000);
    return base_project_name + number;
};

let userId = "test@test.mc";

let project = null;
let experiment = null;
let process_list = null;
let sample_list = null;
let file_list = null;

before(function*() {

    this.timeout(8000); // this test suite can take up to 8 seconds

    let user = yield dbModelUsers.getUser(userId);
    assert.isOk(user, "No test user available = " + userId);
    assert.equal(userId,user.id);

    let valOrError = yield buildDemoProject.findOrBuildAllParts(user,demoProjectConf.datapathPrefix);
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
    assert.equal(updated_project.id,project_id);
    project = updated_project;
});

describe('Feature - Experiments: ', function() {
    describe('Delete Experiment - in parts: ', function () {
        it('deletes best_measure_history', function* (){
            let experiment_id = experiment.id;
            assert.isOk(experiment_id);

            // chain from experiment_id -> property_id list through:
            //   experiment2sample - samples
            //   sample2propertyset - propertysets
            //   propertyset2property - properties
            //   best_measure_history
            // to get best_measure_history items by property_id

            let idList = yield r.table('experiment2sample')
                .getAll(experiment_id,{index:'experiment_id'})
                .eqJoin('sample_id',r.table('samples')).zip()
                .eqJoin('sample_id',r.table('sample2propertyset'),{index: 'sample_id'}).zip()
                .eqJoin('property_set_id',r.table('propertysets')).zip()
                .eqJoin('property_set_id',r.table('propertyset2property'),{index: 'property_set_id'}).zip()
                .eqJoin('property_id',r.table('properties')).zip()
                .eqJoin('property_id',r.table('best_measure_history'),{index: 'property_id'}).zip()
                .getField('property_id');
            let delete_msg = yield r.table('best_measure_history')
                .getAll(r.args([...idList]),{index: 'property_id'}).delete();
            assert.equal(delete_msg.deleted, 1);
        });
    });
});
