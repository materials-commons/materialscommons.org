'use strict';
require('mocha');
import {it} from 'mocha';
require('co-mocha');
const _ = require('lodash');
const chai = require('chai');
const assert = chai.assert;
const should = chai.should();
const fs = require('fs');
const os = require('os');
const promise = require('bluebird');
const md5File = promise.promisify(require('md5-file'));
const copy = require('copy');
const copyOne = promise.promisify(copy.one);

const r = require('rethinkdbdash')({
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815
});

const backend_base = '../../../..';
const dbModelUsers = require(backend_base + '/servers/mcapi/db/model/users');
const projects = require(backend_base + '/servers/mcapi/db/model/projects');
const directories = require(backend_base + '/servers/mcapi/db/model/directories');
const files = require(backend_base + '/servers/mcapi/db/model/files');
const users = require(backend_base + '/servers/mcapi/resources/users');
const helper = require(backend_base + '/servers/lib/build-demo-project-helper');
const fileUtils = require(backend_base + '/servers/lib/create-file-utils');

const fullname = "Test User";
const user_apikey = "ThisIsAJunkKey";
const user1Id = "mctest@mc.org";

const base_project_name = "Demo project test: ";

// **vv  NOTE: See const section of helper; ref - const helper above vv**
const demoProjectTestUserId = 'test@test.mc';
const demoProjectTestUserKey = "totally-bogus";
const demoProjectName = "Demo Project";
const demoProjectDescription = "A project for trying things out.";
const demoProjectExperimentName = "Demo: Microsegregation in HPDC L380";
const demoProjectExperimentDescription =
    "A demo experiment - A study of microsegregation in High Pressure Die Cast L380.";

const createSamplesTemplateId = 'global_Create Samples';
const sectioningTemplateId = 'global_Sectioning';
const ebsdTemplateId = 'global_EBSD SEM Data Collection';
const epmaTemplateId = 'global_EPMA Data Collection';

const processesData = [
    {
        name: 'Lift 380 Casting Day  # 1',
        templateId: createSamplesTemplateId,
        properties: [
            // Note: non-simple values do not appear to be working correctly, issue #998
            // {attribute: 'manufacturing_date', value: new Date('Feb 1, 2017')},           // February 1, 2017 == 1485977519347
            // {attribute: "production_method", value: {name: "Cast", value: "cast"}},
            {attribute: 'manufacturer', value: 'Ohio State University'},
            {attribute: 'supplier', value: 'Ohio State University'}
        ],
        measurements: [
            {
                name: "Composition",
                attribute: "composition",
                otype: "composition",
                unit: "at%",
                value: [
                    {"element": "Al", "value": 94},
                    {"element": "Ca", "value": 1},
                    {"element": "Zr", "value": 5}],
                is_best_measure: true
            }
        ]
    },
    {
        name: 'Casting L124',
        templateId: sectioningTemplateId,
        properties: [],
        measurements: []
    },
    {
        name: 'Sectioning of Casting L124',
        templateId: sectioningTemplateId,
        properties: [],
        measurements: []
    },
    {
        name: 'EBSD SEM Data Collection - 5 mm plate',
        templateId: ebsdTemplateId,
        properties: [
            {attribute: 'voltage', value: 31, unit: 'kV'},
            {attribute: 'sample_tilt', value: 70},
            {attribute: 'scan_size_width', value: 2500},
            {attribute: 'scan_size_height', value: 2500},
            {attribute: 'step_size', value: 1},
            {attribute: 'working_distance', value: 20}
        ],
        measurements: []
    },
    {
        name: 'EPMA Data Collection - 5 mm plate - center',
        templateId: epmaTemplateId,
        properties: [
            // Note: non-simple values do not appear to be working correctly, issue #998
            // {attribute: 'scan_type', value: {name: "Grid", value: "grid"}},
            {attribute: 'voltage', value: 15, unit: 'kV'},
            {attribute: 'beam_current', value: 20, unit: 'nA'},
            {attribute: 'step_size', value: 10},
            {attribute: 'grid_dimensions', value: '20 x 20'},
            {attribute: 'location', value: 'center, mid-thickness'}
        ],
        measurements: []
    }
];

const sampleNameData = [
    'l380', 'L124', 'L124 - 2mm plate', 'L124 - 3mm plate',
    'L124 - 5mm plate', 'L124 - 5mm plate - 3ST', 'L124 - tensil bar, gage'
];

const outputSampleIndexMap = [
    {processIndex: 0, sampleIndexList: [0]},
    {processIndex: 1, sampleIndexList: [1]},
    {processIndex: 2, sampleIndexList: [2, 3, 4, 5, 6]}
];

const inputSampleIndexMap = [
    {processIndex: 1, sampleIndexList: [0]},
    {processIndex: 2, sampleIndexList: [1]},
    {processIndex: 3, sampleIndexList: [4]},
    {processIndex: 4, sampleIndexList: [4]}
];

// **^^  NOTE: See const section of helper; ref - const helper above ^^**

let random_name = function () {
    let number = Math.floor(Math.random() * 10000);
    return base_project_name + number;
};

before(function*() {
    let user = yield dbModelUsers.getUser(user1Id);
    if (!user) {
        let results = yield r.db('materialscommons').table('users').insert({
            admin: false,
            affiliation: "",
            avatar: "",
            description: "",
            email: user1Id,
            apikey: user_apikey,
            fullname: fullname,
            homepage: "",
            id: user1Id,
            name: fullname,
            preferences: {
                tags: [],
                templates: []
            }
        });
        assert.equal(results.inserted, 1, "The User was correctly inserted");
    } else {
        assert.equal(user.id, user1Id, "Wrong test user, id = " + user.id);
    }
});

describe('Feature - User - Build Demo Project Support: ', function () {
    describe('User for test', function () {
        it('exists', function *() {
            let user = yield dbModelUsers.getUser(user1Id);
            assert.isNotNull(user, "test user exists");
            assert.equal(user.apikey, user_apikey);
            assert.equal(user.id, user1Id);
            assert.equal(user.name, fullname);
        })
    });
    describe('List of files for build', function () {
        it('exists in folder', function *() {
            let datapath = 'backend/scripts/demo-project/demo_project_data';
            assert(fs.existsSync(datapath), "missing test datafile dir " + datapath);
            for (let i = 0; i < helper.filesDescriptions().length; i++) {
                let checksumAndFilename = helper.filesDescriptions()[i];
                let expectedChecksum = checksumAndFilename[0];
                let filename = checksumAndFilename[1];
                let path = `${datapath}/${filename}`;
                assert(fs.existsSync(path), "missing test datafile " + datapath + "/" + filename);
                let checksum = yield md5File(path);
                assert(expectedChecksum == checksum, "Checksums should be equal for file: " +
                    filename + "; but expected " + expectedChecksum + " and got " + checksum);
            }
        });
        it('can be inserted in database', function*() {
            let datapath = 'backend/scripts/demo-project/demo_project_data';
            let user = yield dbModelUsers.getUser(user1Id);
            assert.isNotNull(user, "test user exists");
            let projectName = random_name();
            let attrs = {
                name: projectName,
                description: "This is a test project for automated testing."
            };
            let ret = yield projects.createProject(user, attrs);
            let project = ret.val;
            assert.equal(projectName, project.name);
            assert.equal(user.id, project.owner);
            let top_directory = yield directories.get(project.id, 'top');
            assert.equal(top_directory.otype, "directory");
            assert.equal(top_directory.name, project.name);
            let tempDir = os.tmpdir();
            let fileResults = {};
            let fileCount = 0;
            for (let i = 0; i < helper.filesDescriptions().length; i++) {
                let checksumFilenameAndMimetype = helper.filesDescriptions()[i];
                let expectedChecksum = checksumFilenameAndMimetype[0];
                let filename = checksumFilenameAndMimetype[1];
                let mimetype = checksumFilenameAndMimetype[2];
                let path = `${datapath}/${filename}`;
                assert(fs.existsSync(path), "missing test datafile " + datapath + "/" + filename);
                let checksum = yield md5File(path);
                assert(expectedChecksum == checksum, "Checksums should be equal for file: " +
                    filename + "; but expected " + expectedChecksum + " and got " + checksum);
                let stats = fs.statSync(path);
                let fileSizeInBytes = stats.size;
                let source = yield copyOne(path, tempDir);
                path = source.path;
                let args = {
                    name: filename,
                    checksum: checksum,
                    mediatype: fileUtils.mediaTypeDescriptionsFromMime(mimetype),
                    filesize: fileSizeInBytes,
                    filepath: path
                };
                let file = yield directories.ingestSingleLocalFile(project.id, top_directory.id, user.id, args);
                should.exist(file);
                assert.equal(file.name, filename);
                assert.equal(file.checksum, checksum);
                fileResults[file.checksum] = file;
            }
            for (let i = 0; i < helper.filesDescriptions().length; i++) {
                let checksumFilenameAndMimetype = helper.filesDescriptions()[i];
                let expectedChecksum = checksumFilenameAndMimetype[0];
                let filename = checksumFilenameAndMimetype[1];
                let file = fileResults[expectedChecksum];
                should.exist(file, "file with filname = " + filename + " in not in the results");
                assert.equal(file.name, filename);
            }
        });
        it('is in the database', function*() {
            let datapath = 'backend/scripts/demo-project/demo_project_data';
            assert(fs.existsSync(datapath), "missing test datafile dir " + datapath);
            for (let i = 0; i < helper.filesDescriptions().length; i++) {
                let checksumAndFilename = helper.filesDescriptions()[i];
                let checksum = checksumAndFilename[0];
                let filename = checksumAndFilename[1];
                let fileList = yield files.getAllByChecksum(checksum);
                let file = null;
                for (let i = 0; i < fileList.length; i++) {
                    if (!fileList[i].usesid) file = fileList[i];
                }
                assert(file, "Missing original file for " + filename);
                file = yield files.get(file.id);
                assert(file.name == filename, "Filename for file by checksum for filename = " + filename +
                    "; with checksum = " + checksum + "; expected " + filename + " but found " + file.name);
            }
        });
    });
    describe('Build Demo Project helper supporting functions', function () {
        it('checkes for missing files in folder', function*() {
            let missingFiles = yield helper.filesMissingInFolder();
            assert.lengthOf(missingFiles, 0);
        });
        it('adds all files to top dir of a test Demo Project', function*() {
            let user = yield dbModelUsers.getUser(user1Id);
            assert.isNotNull(user, "test user exists");

            let projectName = random_name();
            let attrs = {
                name: projectName,
                description: "This is a test project for automated testing."
            };
            let ret = yield projects.createProject(user, attrs);
            let project = ret.val;
            assert.equal(projectName, project.name);
            assert.equal(user.id, project.owner);

            yield helper.addAllFiles(user, project);
            let files = yield helper.filesForProject(project);
            assert.lengthOf(files, helper.filesDescriptions().length);

            let missingFiles = yield helper.filesMissingInDatabase(project);
            assert.lengthOf(missingFiles, 0);

        });
        it('create a table of all templates', function*() {
            let table = yield helper.makeTemplateTable();
            assert.isOk(table, "table is undefined");
            assert(!_.isEmpty(table), "table is empty");
            assert.isOk(table[createSamplesTemplateId], `table has a value for '${createSamplesTemplateId}'`);
            assert.isOk(table[sectioningTemplateId], `table has a value for '${sectioningTemplateId}'`);
            assert.isOk(table[ebsdTemplateId], `table has a value for '${ebsdTemplateId}'`);
            assert.isOk(table[epmaTemplateId], `table has a value for '${epmaTemplateId}'`);
        });
    });
    describe('Build Demo Project helper main functions', function () {
        it('demo project test user exists', function *() {
            let user = yield dbModelUsers.getUser(demoProjectTestUserId);
            assert.isNotNull(user, "test user exists");
            assert.equal(user.id, demoProjectTestUserId);
            assert.equal(user.name, demoProjectTestUserId);
            assert.equal(user.apikey, demoProjectTestUserKey);
        });
        it('find or create the Demo Project', function*() {
            let user = yield dbModelUsers.getUser(demoProjectTestUserId);
            assert.isNotNull(user, "test user exists");
            assert.equal(user.id, demoProjectTestUserId);

            // Note create project returns the project if it already exists, by name
            // It does not create a duplicate!
            let valOrError = yield helper.createOrFindDemoProjectForUser(user);
            assert.isUndefined(valOrError.error, "Unexpected error from createDemoProjectForUser: " + valOrError.error);

            let project = valOrError.val;
            assert.isNotNull(project, "project is not null");
            assert.equal(project.otype, "project");
            assert.equal(project.name, demoProjectName);
            assert(project.description.includes(demoProjectDescription)); // may have been turned into html!!
            assert.equal(project.owner, demoProjectTestUserId);
        });
        it('find or create the Demo Experiment', function*() {
            let user = yield dbModelUsers.getUser(demoProjectTestUserId);
            assert.isNotNull(user, "test user exists");
            assert.equal(user.id, demoProjectTestUserId);
            let valOrError = yield helper.createOrFindDemoProjectForUser(user);
            assert.isUndefined(valOrError.error, "Unexpected error from createDemoProjectForUser: " + valOrError.error);

            let project = valOrError.val;
            assert.equal(project.name, demoProjectName);

            valOrError = yield helper.createOrFindDemoProjectExperiment(project);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindDemoProjectExperiment: " + valOrError.error);

            let experiment = valOrError.val;
            assert.isNotNull(experiment, "experiment is not null");
            assert.equal(experiment.otype, "experiment");
            assert.equal(experiment.name, demoProjectExperimentName);
            assert(experiment.description.includes(demoProjectExperimentDescription)); // may have been turned into html!!
            assert.equal(experiment.owner, demoProjectTestUserId);
        });
        it('find or create a Demo Process', function*() {
            let user = yield dbModelUsers.getUser(demoProjectTestUserId);
            assert.equal(user.id, demoProjectTestUserId);

            let valOrError = yield helper.createOrFindDemoProjectForUser(user);
            assert.isUndefined(valOrError.error, "Unexpected error from createDemoProjectForUser: " + valOrError.error);
            let project = valOrError.val;
            assert.equal(project.name, demoProjectName);

            valOrError = yield helper.createOrFindDemoProjectExperiment(project);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindDemoProjectExperiment: " + valOrError.error);
            let experiment = valOrError.val;
            assert.equal(experiment.name, demoProjectExperimentName);

            let processData = processesData[0];
            let processName = processData.name;
            let templateId = processData.templateId;

            valOrError = yield helper.createOrFindDemoProcess(project, experiment, processName, templateId);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindDemoProcess: " + valOrError.error);

            let process = valOrError.val;
            assert.equal(process.otype, "process");
            assert.equal(process.name, processName);
            assert.equal(process.template_id, templateId);
            assert.equal(process.owner, demoProjectTestUserId);

        });
        it('find or create all Demo Processes', function*() {
            let user = yield dbModelUsers.getUser(demoProjectTestUserId);
            assert.equal(user.id, demoProjectTestUserId);

            let valOrError = yield helper.createOrFindDemoProjectForUser(user);
            assert.isUndefined(valOrError.error, "Unexpected error from createDemoProjectForUser: " + valOrError.error);
            let project = valOrError.val;
            assert.equal(project.name, demoProjectName);

            valOrError = yield helper.createOrFindDemoProjectExperiment(project);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindDemoProjectExperiment: " + valOrError.error);
            let experiment = valOrError.val;
            assert.equal(experiment.name, demoProjectExperimentName);

            valOrError = yield helper.createOrFindAllDemoProcesses(project, experiment);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindAllDemoProcesses: " + valOrError.error);

            let processes = valOrError.val;
            assert.ok(processes);
            assert.lengthOf(processes, processesData.length);
            for (let i = 0; i < processesData.length; i++) {
                let processData = processesData[i];
                let processName = processData.name;
                let templateId = processData.templateId;

                let process = processes[i];

                assert.equal(process.otype, "process");
                assert.equal(process.name, processName);
                assert.equal(process.template_id, templateId);
                assert.equal(process.owner, demoProjectTestUserId);

            }
        });
        it('find or create the output samples for a given Process', function*() {
            let user = yield dbModelUsers.getUser(demoProjectTestUserId);
            assert.equal(user.id, demoProjectTestUserId);

            let valOrError = yield helper.createOrFindDemoProjectForUser(user);
            assert.isUndefined(valOrError.error, "Unexpected error from createDemoProjectForUser: " + valOrError.error);
            let project = valOrError.val;
            assert.equal(project.name, demoProjectName);

            valOrError = yield helper.createOrFindDemoProjectExperiment(project);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindDemoProjectExperiment: " + valOrError.error);
            let experiment = valOrError.val;
            assert.equal(experiment.name, demoProjectExperimentName);

            let mapEntry = outputSampleIndexMap[2];

            let processData = processesData[mapEntry.processIndex];
            let processName = processData.name;
            let templateId = processData.templateId;

            valOrError = yield helper.createOrFindDemoProcess(project, experiment, processName, templateId);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindDemoProcess: " + valOrError.error);

            let process = valOrError.val;

            let sampleIndexList = mapEntry.sampleIndexList;
            let sampleNames = [];
            for (let i = 0; i < sampleIndexList.length; i++) {
                sampleNames.push(sampleNameData[sampleIndexList[i]]);
            }

            valOrError = yield helper.createOrFindProcessOutputSamples(project, experiment, process, sampleNames);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindProcessOutputSamples: " + valOrError.error);

            let samples = valOrError.val;
            assert.isOk(samples);
            assert.lengthOf(samples, sampleNames.length);
            for (let i = 0; i < sampleNames.length; i++) {
                let sample = samples[i];
                let name = sampleNames[i];
                assert.equal(name, sample.name);
            }
        });
        it('find or create the output samples for all Process', function*() {
            let user = yield dbModelUsers.getUser(demoProjectTestUserId);
            assert.equal(user.id, demoProjectTestUserId);

            let valOrError = yield helper.createOrFindDemoProjectForUser(user);
            assert.isUndefined(valOrError.error, "Unexpected error from createDemoProjectForUser: " + valOrError.error);
            let project = valOrError.val;
            assert.equal(project.name, demoProjectName);

            valOrError = yield helper.createOrFindDemoProjectExperiment(project);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindDemoProjectExperiment: " + valOrError.error);
            let experiment = valOrError.val;
            assert.equal(experiment.name, demoProjectExperimentName);

            valOrError = yield helper.createOrFindAllDemoProcesses(project, experiment);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindAllDemoProcesses: " + valOrError.error);

            let processes = valOrError.val;
            assert.ok(processes);
            assert.lengthOf(processes, processesData.length);
            for (let i = 0; i < processesData.length; i++) {
                let processData = processesData[i];
                let processName = processData.name;

                let process = processes[i];
                assert.equal(process.otype, "process");
                assert.equal(process.name, processName);
            }

            valOrError = yield helper.createOrFindOutputSamplesForAllProcesses(
                project, experiment, processes, sampleNameData, outputSampleIndexMap);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindOutputSamplesForAllProcesses: " + valOrError.error);

            let samples = valOrError.val;
            assert.isOk(samples);
            assert.lengthOf(samples, sampleNameData.length);
            for (let i = 0; i < sampleNameData.length; i++) {
                let sample = samples[i];
                let name = sampleNameData[i];
                assert.equal(name, sample.name);
            }

        });
        it('find or create the input samples for a given Process', function*() {
            let user = yield dbModelUsers.getUser(demoProjectTestUserId);
            assert.equal(user.id, demoProjectTestUserId);

            let valOrError = yield helper.createOrFindDemoProjectForUser(user);
            assert.isUndefined(valOrError.error, "Unexpected error from createDemoProjectForUser: " + valOrError.error);
            let project = valOrError.val;
            assert.equal(project.name, demoProjectName);

            valOrError = yield helper.createOrFindDemoProjectExperiment(project);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindDemoProjectExperiment: " + valOrError.error);
            let experiment = valOrError.val;
            assert.equal(experiment.name, demoProjectExperimentName);

            valOrError = yield helper.createOrFindAllDemoProcesses(project, experiment);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindAllDemoProcesses: " + valOrError.error);

            let processes = valOrError.val;
            assert.ok(processes);
            assert.lengthOf(processes, processesData.length);
            for (let i = 0; i < processesData.length; i++) {
                let processData = processesData[i];
                let processName = processData.name;

                let process = processes[i];
                assert.equal(process.otype, "process");
                assert.equal(process.name, processName);
            }

            valOrError = yield helper.createOrFindOutputSamplesForAllProcesses(
                project, experiment, processes, sampleNameData, outputSampleIndexMap);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindOutputSamplesForAllProcesses: " + valOrError.error);

            let samples = valOrError.val;
            assert.isOk(samples);
            assert.lengthOf(samples, sampleNameData.length);

            let mapEntry = inputSampleIndexMap[0];
            let process = processes[mapEntry.processIndex];
            let sampleList = [];
            let sampleIndexList = mapEntry.sampleIndexList;

            sampleIndexList.forEach((index) => {
                sampleList.push(samples[sampleIndexList[index]]);
            });

            valOrError = yield helper.createOrFindInputSamplesForProcess(project, experiment, process, sampleList);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindOutputSampleForProcess: " + valOrError.error);

            let inputSampleList = valOrError.val;
            assert.isOk(inputSampleList);
            assert.lengthOf(inputSampleList, sampleIndexList.length);

            let missingSamples = [];
            sampleList.forEach((sample) => {
                let found = false;
                inputSampleList.forEach((inputSample) => {
                    if (sample.id == inputSample.id) {
                        found = true;
                    }
                });
                if (!found) {
                    misingSamples.push(sample);
                }
            });

            assert.lengthOf(missingSamples, 0, "Samples missing from input_samplesa of perocess");

        });
        it('find or create the input samples for all Processes', function*() {
            let user = yield dbModelUsers.getUser(demoProjectTestUserId);
            assert.equal(user.id, demoProjectTestUserId);

            let valOrError = yield helper.createOrFindDemoProjectForUser(user);
            assert.isUndefined(valOrError.error, "Unexpected error from createDemoProjectForUser: " + valOrError.error);
            let project = valOrError.val;
            assert.equal(project.name, demoProjectName);

            valOrError = yield helper.createOrFindDemoProjectExperiment(project);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindDemoProjectExperiment: " + valOrError.error);
            let experiment = valOrError.val;
            assert.equal(experiment.name, demoProjectExperimentName);

            valOrError = yield helper.createOrFindAllDemoProcesses(project, experiment);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindAllDemoProcesses: " + valOrError.error);

            let processes = valOrError.val;
            assert.ok(processes);
            assert.lengthOf(processes, processesData.length);
            for (let i = 0; i < processesData.length; i++) {
                let processData = processesData[i];
                let processName = processData.name;

                let process = processes[i];
                assert.equal(process.otype, "process");
                assert.equal(process.name, processName);
            }

            valOrError = yield helper.createOrFindOutputSamplesForAllProcesses(
                project, experiment, processes, sampleNameData, outputSampleIndexMap);
            assert.isUndefined(valOrError.error,
                "Unexpected error from createOrFindOutputSamplesForAllProcesses: " + valOrError.error);

            let samples = valOrError.val;
            assert.isOk(samples);
            assert.lengthOf(samples, sampleNameData.length);

            valOrError = yield helper.createOrFindInputSamplesForAllProcesses(
                project, experiment, processes, samples, inputSampleIndexMap);
            assert.isUndefined(valOrError.error,
                "Unexpected error from createOrFindInputSamplesForAllProcesses: " + valOrError.error);

            let inputSampleListList = valOrError.val;
            assert.isOk(inputSampleListList);
            assert.lengthOf(inputSampleListList, inputSampleIndexMap.length);

            for (let i = 0; i < inputSampleListList.length; i++) {
                let mapEntry = inputSampleIndexMap[i];
                let processName = processes[mapEntry.processIndex].name;
                let indexList = mapEntry.sampleIndexList;
                let inputSampleList = inputSampleListList[i];
                assert.lengthOf(inputSampleList, indexList.length, "Missing samples for process with name: " + processName);
            }
        });
        it('add the setup values for a given Process', function*() {

            let user = yield dbModelUsers.getUser(demoProjectTestUserId);
            assert.equal(user.id, demoProjectTestUserId);

            let valOrError = yield helper.createOrFindDemoProjectForUser(user);
            assert.isUndefined(valOrError.error, "Unexpected error from createDemoProjectForUser: " + valOrError.error);
            let project = valOrError.val;
            assert.equal(project.name, demoProjectName);

            valOrError = yield helper.createOrFindDemoProjectExperiment(project);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindDemoProjectExperiment: " + valOrError.error);
            let experiment = valOrError.val;
            assert.equal(experiment.name, demoProjectExperimentName);

            valOrError = yield helper.createOrFindAllDemoProcesses(project, experiment);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindAllDemoProcesses: " + valOrError.error);

            let processes = valOrError.val;
            assert.ok(processes);
            assert.lengthOf(processes, processesData.length);
            for (let i = 0; i < processesData.length; i++) {
                let processData = processesData[i];
                let processName = processData.name;

                let process = processes[i];
                assert.equal(process.otype, "process");
                assert.equal(process.name, processName);
            }

            // Note: refresh process list. If they were created for the first time on the above call, then the
            // body of the returned process is not sufficently decorated to support inserting properties;
            // however, on refresh it is. Needs to be investigated.
            valOrError = yield helper.createOrFindAllDemoProcesses(project, experiment);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindAllDemoProcesses: " + valOrError.error);

            processes = valOrError.val;
            assert.ok(processes);
            assert.lengthOf(processes, processesData.length);
            for (let i = 0; i < processesData.length; i++) {
                let processData = processesData[i];
                let processName = processData.name;

                let process = processes[i];
                assert.equal(process.otype, "process");
                assert.equal(process.name, processName);
            }
            
            let processIndex = 0;
            let process = processes[processIndex];

            let templateId = process['template_id'];
            let templateTable = yield helper.makeTemplateTable();
            let template = templateTable[templateId];
            let templatePropertyList = template.setup[0].properties;

            let templetPropertyTable = {};
            templatePropertyList.forEach((property) => {
                templetPropertyTable[property.attribute] = property;
            });

            let processSetupPropertyList = process.setup[0].properties;
            let processSetupTable = {};
            processSetupPropertyList.forEach((property) => {
                processSetupTable[property.attribute] = property;
            });

            assert.lengthOf(templatePropertyList,processSetupPropertyList.length,
                "Lengths of property-list in process and template should match")
            processSetupPropertyList.forEach((check) => {
                assert.ok(templetPropertyTable[check.attribute],
                    "unexpected property attribute in process: " + check.attribute);
                assert.equal(templetPropertyTable[check.attribute].otype, check.otype,
                    "Type mismatch for property with attribute: " + check.attribute);
            });

            let valuesForSetup = processesData[processIndex].properties;

            let args = [];
            valuesForSetup.forEach((setupValue) => {
                let property = processSetupTable[setupValue.attribute];

                if (property) {
                    property.setup_attribute = "instrument";
                    property.value = setupValue.value;
                    if (setupValue.unit) {
                        property.unit = setupValue.unit;
                    }
                    args.push(property);
                }
                else {
                    assert.fail("Template is missing expected attribute: " + setupValue.attribute);
                }
            });

            valOrError = yield helper.createOrFindDemoProcessSetupProperties(project,experiment,process,args);
            if (valOrError.error) {
                console.log("           Error expanded from setup properties: " ,
                    JSON.stringify(valOrError.error));
            }
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindDemoSetupProperties: " + valOrError.error);
            let updatedProcess = valOrError.val;

            assert.equal(process.id, updatedProcess.id, `Updated process for '${process.name}'`);

            let updatedProperties = updatedProcess.setup[0].properties;

            valOrError = yield helper.createOrFindAllDemoProcesses(project, experiment);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindAllDemoProcesses: " + valOrError.error);

            processes = valOrError.val;
            assert.ok(processes);
            assert.lengthOf(processes, processesData.length);
            for (let i = 0; i < processesData.length; i++) {
                let probe = processes[i];
                if (probe.id == process.id) {
                    updatedProcess = probe;
                    updatedProperties = probe.setup[0].properties;
                }
            }

            assert.equal(process.id, updatedProcess.id, `Updated process for '${process.name}'`);
            let updatedPropertyTable = {};
            updatedProperties.forEach((property) => {
                updatedPropertyTable[property.attribute] = property;
            });

            valuesForSetup.forEach((setupValue) => {
                let property = updatedPropertyTable[setupValue.attribute];

                if (property) {
                    assert.equal(property.value, setupValue.value, "Value for process " + process.name
                        + " property with attribute" + setupValue.attribute);
                    if (setupValue.unit) {
                        assert.equal(property.unit, setupValue.unit, "Unit for process " + process.name
                            + " property with attribute" + setupValue.attribute);
                    }
                }
                else {
                    assert.fail("Process " + process.name
                        + " is missing expected setup value attribute: " + setupValue.attribute);
                }
            });

        });
        it('add the setup values for all Processes', function*() {

            let user = yield dbModelUsers.getUser(demoProjectTestUserId);
            assert.equal(user.id, demoProjectTestUserId);

            let valOrError = yield helper.createOrFindDemoProjectForUser(user);
            assert.isUndefined(valOrError.error, "Unexpected error from createDemoProjectForUser: " + valOrError.error);
            let project = valOrError.val;
            assert.equal(project.name, demoProjectName);

            valOrError = yield helper.createOrFindDemoProjectExperiment(project);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindDemoProjectExperiment: " + valOrError.error);
            let experiment = valOrError.val;
            assert.equal(experiment.name, demoProjectExperimentName);

            valOrError = yield helper.createOrFindAllDemoProcesses(project, experiment);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindAllDemoProcesses: " + valOrError.error);

            let processes = valOrError.val;
            assert.ok(processes);
            assert.lengthOf(processes, processesData.length);
            for (let i = 0; i < processesData.length; i++) {
                let processData = processesData[i];
                let processName = processData.name;

                let process = processes[i];
                assert.equal(process.otype, "process");
                assert.equal(process.name, processName);
            }

            // Note: refresh process list. If they were created for the first time on the above call, then the
            // body of the returned process is not sufficently decorated to support inserting properties;
            // however, on refresh it is. Needs to be investigated.
            valOrError = yield helper.createOrFindAllDemoProcesses(project, experiment);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindAllDemoProcesses: " + valOrError.error);

            processes = valOrError.val;
            assert.ok(processes);
            assert.lengthOf(processes, processesData.length);
            for (let i = 0; i < processesData.length; i++) {
                let processData = processesData[i];
                let processName = processData.name;

                let process = processes[i];
                assert.equal(process.otype, "process");
                assert.equal(process.name, processName);
            }

            valOrError = yield helper.createOrFindSetupPropertiesForAllDemoProcesses(project,experiment,processes);
            assert.isUndefined(valOrError.error,
                "Unexpected error from createOrFindSetupPropertiesForAllDemoProcesses: " + valOrError.error);

            processes = valOrError.val;
            assert.lengthOf(processes, processesData.length);

            for (let processIndex = 0; processIndex < processes.length; processIndex++) {
                let updatedProcess = processes[processIndex];
                let updatedProperties = updatedProcess.setup[0].properties;
                let valuesForSetup = processesData[processIndex].properties;
                if (valuesForSetup && valuesForSetup.length < 0) {

                    let updatedPropertyTable = {};
                    updatedProperties.forEach((property) => {
                        updatedPropertyTable[property.attribute] = property;
                    });

                    valuesForSetup.forEach((setupValue) => {
                        let property = updatedPropertyTable[setupValue.attribute];

                        if (property) {
                            assert.equal(property.value, setupValue.value, "Value for process " + process.name
                                + " property with attribute" + setupValue.attribute);
                            if (setupValue.unit) {
                                console.log("unit - " + setupValue.attribute + ': ' + property.unit);
                                assert.equal(property.unit, setupValue.unit, "Unit for process " + process.name
                                    + " property with attribute" + setupValue.attribute);
                            }
                        }
                        else {
                            assert.fail("Process " + process.name
                                + " is missing expected setup value attribute: " + setupValue.attribute);
                        }
                    });

                }
            }

        });
        it('add the measurement values for the only Process with a measurement', function*() {
            let user = yield dbModelUsers.getUser(demoProjectTestUserId);
            assert.equal(user.id, demoProjectTestUserId);

            let valOrError = yield helper.createOrFindDemoProjectForUser(user);
            assert.isUndefined(valOrError.error, "Unexpected error from createDemoProjectForUser: " + valOrError.error);
            let project = valOrError.val;
            assert.equal(project.name, demoProjectName);

            valOrError = yield helper.createOrFindDemoProjectExperiment(project);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindDemoProjectExperiment: " + valOrError.error);
            let experiment = valOrError.val;
            assert.equal(experiment.name, demoProjectExperimentName);

            valOrError = yield helper.createOrFindAllDemoProcesses(project, experiment);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindAllDemoProcesses: " + valOrError.error);

            // Note: refresh process list. If they were created for the first time on the above call, then the
            // body of the returned process is not sufficently decorated to support inserting properties;
            // however, on refresh it is. Needs to be investigated.
            valOrError = yield helper.createOrFindAllDemoProcesses(project, experiment);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindAllDemoProcesses: " + valOrError.error);

            let processes = valOrError.val;
            let process = processes[0];
            let processData = processesData[0];
            let measurement = processData.measurements[0];

            valOrError = yield helper.updateMeasurementForProcessSamples(process,measurement);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindMeasurement: " + valOrError.error);

            let samples = valOrError.val;
            let sample = samples[0];
            let updatedProcess = null;
            sample.processes.forEach((probe) => {
                if (probe.id == process.id) {
                    updatedProcess = probe;
                }
            });

            let updatedmeasurement = updatedProcess.measurements[0];

            assert.equal(measurement.attribute,updatedmeasurement.attribute);
            assert.equal(measurement.name,updatedmeasurement.name);
            assert.equal(measurement.otype,updatedmeasurement.otype);
            assert.equal(measurement.unit,updatedmeasurement.unit);
            assert.lengthOf(updatedmeasurement.value,measurement.value.length);
            for (let i = 0; i < measurement.value.length; i++) {
                assert.equal(updatedmeasurement.value[i].element,measurement.value[i].element)
                assert.equal(updatedmeasurement.value[i].value,measurement.value[i].value)
            }

        });
    });
});


