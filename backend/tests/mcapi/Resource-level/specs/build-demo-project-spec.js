'use strict';
require('mocha');
const it = require('mocha').it;
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

const fileUtils = require('../../../../servers/lib/create-file-utils');

const mcapi_base = '../../../../servers/mcapi/';

const dbModelUsers = require(mcapi_base + 'db/model/users');
const projects = require(mcapi_base + 'db/model/projects');
const directories = require(mcapi_base + 'db/model/directories');
const files = require(mcapi_base + 'db/model/files');
const users = require(mcapi_base + 'resources/users');

const helper = require(mcapi_base + 'build-demo/build-demo-project-helper');
const demoProjectConf = require(mcapi_base + 'build-demo/build-demo-project-conf');
const buildDemoProject = require(mcapi_base + 'build-demo/build-demo-project');

const base_project_name = "Demo project test: ";

const demoProjectTestUserId = 'test@test.mc';
const demoProjectTestUserKey = "totally-bogus";

let random_name = function () {
    let number = Math.floor(Math.random() * 10000);
    return base_project_name + number;
};

before(function*() {

    this.timeout(8000); // some tests in this test suite can take up to 8 seconds

    let user = yield dbModelUsers.getUser(demoProjectTestUserId);
    assert.isOk(user, "Missing test user, id = " + demoProjectTestUserId);
});

describe('Feature - User - Build Demo Project Support: ', function () {
    describe('User for test', function () {
        it('exists', function *() {
            let user = yield dbModelUsers.getUser(demoProjectTestUserId);
            assert.isNotNull(user, "test user exists");
            assert.equal(user.apikey,demoProjectTestUserKey);
            assert.equal(user.id, demoProjectTestUserId);
        })
    });
    describe('List of files for build', function () {
        it('exists in folder', function *() {
            assert(fs.existsSync(demoProjectConf.fullDatapath),
                "missing test datafile dir " + demoProjectConf.fullDatapath);
            for (let i = 0; i < helper.filesDescriptions().length; i++) {
                let checksumAndFilename = helper.filesDescriptions()[i];
                let expectedChecksum = checksumAndFilename[0];
                let filename = checksumAndFilename[1];
                let path = `${demoProjectConf.fullDatapath}/${filename}`;
                assert(fs.existsSync(path),
                    "missing test datafile " + demoProjectConf.fullDatapath + "/" + filename);
                let checksum = yield md5File(path);
                assert(expectedChecksum == checksum, "Checksums should be equal for file: " +
                    filename + "; but expected " + expectedChecksum + " and got " + checksum);
            }
        });
        it('can be inserted in database', function*() {
            let user = yield dbModelUsers.getUser(demoProjectTestUserId);
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
                let path = `${demoProjectConf.fullDatapath}/${filename}`;
                assert(fs.existsSync(path),
                    "missing test datafile " + demoProjectConf.fullDatapath + "/" + filename);
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
            assert(fs.existsSync(demoProjectConf.fullDatapath),
                "missing test datafile dir " + demoProjectConf.fullDatapath);
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
            let missingFiles = yield helper.filesMissingInFolder(demoProjectConf.datapathPrefix);
            assert.lengthOf(missingFiles, 0);
        });
        it('adds all files to top dir of a test Demo Project', function*() {
            let user = yield dbModelUsers.getUser(demoProjectTestUserId);
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

            yield helper.addAllFilesToProject(user, project, demoProjectConf.datapathPrefix);
            let files = yield helper.filesForProject(project);
            assert.lengthOf(files, helper.filesDescriptions().length);

            let missingFiles = yield helper.filesMissingInDatabase(project);
            assert.lengthOf(missingFiles, 0);

        });
        it('create a table of all templates', function*() {
            let table = yield helper.makeTemplateTable();
            assert.isOk(table, "table is undefined");
            assert(!_.isEmpty(table), "table is empty");
            assert.isOk(table[demoProjectConf.createSamplesTemplateId], `table has a value for '${demoProjectConf.createSamplesTemplateId}'`);
            assert.isOk(table[demoProjectConf.sectioningTemplateId], `table has a value for '${demoProjectConf.sectioningTemplateId}'`);
            assert.isOk(table[demoProjectConf.ebsdTemplateId], `table has a value for '${demoProjectConf.ebsdTemplateId}'`);
            assert.isOk(table[demoProjectConf.epmaTemplateId], `table has a value for '${demoProjectConf.epmaTemplateId}'`);
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
            assert.equal(project.name, demoProjectConf.demoProjectName);
            assert(project.description.includes(demoProjectConf.demoProjectDescription)); // may have been turned into html!!
            assert.equal(project.owner, demoProjectTestUserId);
        });
        it('find or create the Demo Experiment', function*() {
            let user = yield dbModelUsers.getUser(demoProjectTestUserId);
            assert.isNotNull(user, "test user exists");
            assert.equal(user.id, demoProjectTestUserId);
            let valOrError = yield helper.createOrFindDemoProjectForUser(user);
            assert.isUndefined(valOrError.error, "Unexpected error from createDemoProjectForUser: " + valOrError.error);

            let project = valOrError.val;
            assert.equal(project.name, demoProjectConf.demoProjectName);

            valOrError = yield helper.createOrFindDemoProjectExperiment(project);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindDemoProjectExperiment: " + valOrError.error);

            let experiment = valOrError.val;
            assert.isNotNull(experiment, "experiment is not null");
            assert.equal(experiment.otype, "experiment");
            assert.equal(experiment.name, demoProjectConf.demoProjectExperimentName);
            assert(experiment.description.includes(demoProjectConf.demoProjectExperimentDescription)); // may have been turned into html!!
            assert.equal(experiment.owner, demoProjectTestUserId);
        });
        it('find or create a Demo Process', function*() {
            let user = yield dbModelUsers.getUser(demoProjectTestUserId);
            assert.equal(user.id, demoProjectTestUserId);

            let valOrError = yield helper.createOrFindDemoProjectForUser(user);
            assert.isUndefined(valOrError.error, "Unexpected error from createDemoProjectForUser: " + valOrError.error);
            let project = valOrError.val;
            assert.equal(project.name, demoProjectConf.demoProjectName);

            valOrError = yield helper.createOrFindDemoProjectExperiment(project);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindDemoProjectExperiment: " + valOrError.error);
            let experiment = valOrError.val;
            assert.equal(experiment.name, demoProjectConf.demoProjectExperimentName);

            let processData = demoProjectConf.processesData[0];
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
            assert.equal(project.name, demoProjectConf.demoProjectName);

            valOrError = yield helper.createOrFindDemoProjectExperiment(project);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindDemoProjectExperiment: " + valOrError.error);
            let experiment = valOrError.val;
            assert.equal(experiment.name, demoProjectConf.demoProjectExperimentName);

            valOrError = yield helper.createOrFindAllDemoProcesses(project, experiment);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindAllDemoProcesses: " + valOrError.error);

            let processes = valOrError.val;
            assert.ok(processes);
            assert.lengthOf(processes, demoProjectConf.processesData.length);
            for (let i = 0; i < demoProjectConf.processesData.length; i++) {
                let processData = demoProjectConf.processesData[i];
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
            assert.equal(project.name, demoProjectConf.demoProjectName);

            valOrError = yield helper.createOrFindDemoProjectExperiment(project);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindDemoProjectExperiment: " + valOrError.error);
            let experiment = valOrError.val;
            assert.equal(experiment.name, demoProjectConf.demoProjectExperimentName);

            let mapEntry = demoProjectConf.outputSampleIndexMap[2];

            let processData = demoProjectConf.processesData[mapEntry.processIndex];
            let processName = processData.name;
            let templateId = processData.templateId;

            valOrError = yield helper.createOrFindDemoProcess(project, experiment, processName, templateId);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindDemoProcess: " + valOrError.error);

            let process = valOrError.val;

            let sampleIndexList = mapEntry.sampleIndexList;
            let sampleNames = [];
            for (let i = 0; i < sampleIndexList.length; i++) {
                sampleNames.push(demoProjectConf.sampleNameData[sampleIndexList[i]]);
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
            assert.equal(project.name, demoProjectConf.demoProjectName);

            valOrError = yield helper.createOrFindDemoProjectExperiment(project);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindDemoProjectExperiment: " + valOrError.error);
            let experiment = valOrError.val;
            assert.equal(experiment.name, demoProjectConf.demoProjectExperimentName);

            valOrError = yield helper.createOrFindAllDemoProcesses(project, experiment);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindAllDemoProcesses: " + valOrError.error);

            let processes = valOrError.val;
            assert.ok(processes);
            assert.lengthOf(processes, demoProjectConf.processesData.length);
            for (let i = 0; i < demoProjectConf.processesData.length; i++) {
                let processData = demoProjectConf.processesData[i];
                let processName = processData.name;

                let process = processes[i];
                assert.equal(process.otype, "process");
                assert.equal(process.name, processName);
            }

            valOrError = yield helper.createOrFindOutputSamplesForAllProcesses(
                project, experiment, processes, demoProjectConf.sampleNameData, demoProjectConf.outputSampleIndexMap);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindOutputSamplesForAllProcesses: " + valOrError.error);

            let samples = valOrError.val;
            assert.isOk(samples);
            assert.lengthOf(samples, demoProjectConf.sampleNameData.length);
            for (let i = 0; i < demoProjectConf.sampleNameData.length; i++) {
                let sample = samples[i];
                let name = demoProjectConf.sampleNameData[i];
                assert.equal(name, sample.name);
            }

        });
        it('find or create the input samples for a given Process', function*() {
            let user = yield dbModelUsers.getUser(demoProjectTestUserId);
            assert.equal(user.id, demoProjectTestUserId);

            let valOrError = yield helper.createOrFindDemoProjectForUser(user);
            assert.isUndefined(valOrError.error, "Unexpected error from createDemoProjectForUser: " + valOrError.error);
            let project = valOrError.val;
            assert.equal(project.name, demoProjectConf.demoProjectName);

            valOrError = yield helper.createOrFindDemoProjectExperiment(project);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindDemoProjectExperiment: " + valOrError.error);
            let experiment = valOrError.val;
            assert.equal(experiment.name, demoProjectConf.demoProjectExperimentName);

            valOrError = yield helper.createOrFindAllDemoProcesses(project, experiment);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindAllDemoProcesses: " + valOrError.error);

            let processes = valOrError.val;
            assert.ok(processes);
            assert.lengthOf(processes, demoProjectConf.processesData.length);
            for (let i = 0; i < demoProjectConf.processesData.length; i++) {
                let processData = demoProjectConf.processesData[i];
                let processName = processData.name;

                let process = processes[i];
                assert.equal(process.otype, "process");
                assert.equal(process.name, processName);
            }

            valOrError = yield helper.createOrFindOutputSamplesForAllProcesses(
                project, experiment, processes, demoProjectConf.sampleNameData, demoProjectConf.outputSampleIndexMap);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindOutputSamplesForAllProcesses: " + valOrError.error);

            let samples = valOrError.val;
            assert.isOk(samples);
            assert.lengthOf(samples, demoProjectConf.sampleNameData.length);

            let mapEntry = demoProjectConf.inputSampleIndexMap[0];
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
            assert.equal(project.name, demoProjectConf.demoProjectName);

            valOrError = yield helper.createOrFindDemoProjectExperiment(project);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindDemoProjectExperiment: " + valOrError.error);
            let experiment = valOrError.val;
            assert.equal(experiment.name, demoProjectConf.demoProjectExperimentName);

            valOrError = yield helper.createOrFindAllDemoProcesses(project, experiment);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindAllDemoProcesses: " + valOrError.error);

            let processes = valOrError.val;
            assert.ok(processes);
            assert.lengthOf(processes, demoProjectConf.processesData.length);
            for (let i = 0; i < demoProjectConf.processesData.length; i++) {
                let processData = demoProjectConf.processesData[i];
                let processName = processData.name;

                let process = processes[i];
                assert.equal(process.otype, "process");
                assert.equal(process.name, processName);
            }

            valOrError = yield helper.createOrFindOutputSamplesForAllProcesses(
                project, experiment, processes, demoProjectConf.sampleNameData, demoProjectConf.outputSampleIndexMap);
            assert.isUndefined(valOrError.error,
                "Unexpected error from createOrFindOutputSamplesForAllProcesses: " + valOrError.error);

            let samples = valOrError.val;
            assert.isOk(samples);
            assert.lengthOf(samples, demoProjectConf.sampleNameData.length);

            valOrError = yield helper.createOrFindInputSamplesForAllProcesses(
                project, experiment, processes, samples, demoProjectConf.inputSampleIndexMap);
            assert.isUndefined(valOrError.error,
                "Unexpected error from createOrFindInputSamplesForAllProcesses: " + valOrError.error);

            let inputSampleListList = valOrError.val;
            assert.isOk(inputSampleListList);
            assert.lengthOf(inputSampleListList, demoProjectConf.inputSampleIndexMap.length);

            for (let i = 0; i < inputSampleListList.length; i++) {
                let mapEntry = demoProjectConf.inputSampleIndexMap[i];
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
            assert.equal(project.name, demoProjectConf.demoProjectName);

            valOrError = yield helper.createOrFindDemoProjectExperiment(project);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindDemoProjectExperiment: " + valOrError.error);
            let experiment = valOrError.val;
            assert.equal(experiment.name, demoProjectConf.demoProjectExperimentName);

            valOrError = yield helper.createOrFindAllDemoProcesses(project, experiment);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindAllDemoProcesses: " + valOrError.error);

            let processes = valOrError.val;
            assert.ok(processes);
            assert.lengthOf(processes, demoProjectConf.processesData.length);
            for (let i = 0; i < demoProjectConf.processesData.length; i++) {
                let processData = demoProjectConf.processesData[i];
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
            assert.lengthOf(processes, demoProjectConf.processesData.length);
            for (let i = 0; i < demoProjectConf.processesData.length; i++) {
                let processData = demoProjectConf.processesData[i];
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

            assert.lengthOf(templatePropertyList, processSetupPropertyList.length,
                "Lengths of property-list in process and template should match")
            processSetupPropertyList.forEach((check) => {
                assert.ok(templetPropertyTable[check.attribute],
                    "unexpected property attribute in process: " + check.attribute);
                assert.equal(templetPropertyTable[check.attribute].otype, check.otype,
                    "Type mismatch for property with attribute: " + check.attribute);
            });

            let valuesForSetup = demoProjectConf.processesData[processIndex].properties;

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

            valOrError = yield helper.createOrFindDemoProcessSetupProperties(project, experiment, process, args);
            if (valOrError.error) {
                console.log("           Error expanded from setup properties: ",
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
            assert.lengthOf(processes, demoProjectConf.processesData.length);
            for (let i = 0; i < demoProjectConf.processesData.length; i++) {
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
                    if (property.value.name) {
                        assert.ok(property.value.value)
                        assert.ok(setupValue.value.name);
                        assert.ok(setupValue.value.value);
                        assert.equal(property.value.name,setupValue.value.name);
                        assert.equal(property.value.value,setupValue.value.value);
                    } else {
                        assert.equal(property.value, setupValue.value, "Value for process " + process.name
                            + " property with attribute" + setupValue.attribute);
                    }
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
            assert.equal(project.name, demoProjectConf.demoProjectName);

            valOrError = yield helper.createOrFindDemoProjectExperiment(project);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindDemoProjectExperiment: " + valOrError.error);
            let experiment = valOrError.val;
            assert.equal(experiment.name, demoProjectConf.demoProjectExperimentName);

            valOrError = yield helper.createOrFindAllDemoProcesses(project, experiment);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindAllDemoProcesses: " + valOrError.error);

            let processes = valOrError.val;
            assert.ok(processes);
            assert.lengthOf(processes, demoProjectConf.processesData.length);
            for (let i = 0; i < demoProjectConf.processesData.length; i++) {
                let processData = demoProjectConf.processesData[i];
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
            assert.lengthOf(processes, demoProjectConf.processesData.length);
            for (let i = 0; i < demoProjectConf.processesData.length; i++) {
                let processData = demoProjectConf.processesData[i];
                let processName = processData.name;

                let process = processes[i];
                assert.equal(process.otype, "process");
                assert.equal(process.name, processName);
            }

            valOrError = yield helper.createOrFindSetupPropertiesForAllDemoProcesses(project, experiment, processes);
            assert.isUndefined(valOrError.error,
                "Unexpected error from createOrFindSetupPropertiesForAllDemoProcesses: " + valOrError.error);

            processes = valOrError.val;
            assert.lengthOf(processes, demoProjectConf.processesData.length);

            for (let processIndex = 0; processIndex < processes.length; processIndex++) {
                let updatedProcess = processes[processIndex];
                let updatedProperties = updatedProcess.setup[0].properties;
                let valuesForSetup = demoProjectConf.processesData[processIndex].properties;
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
            assert.equal(project.name, demoProjectConf.demoProjectName);

            valOrError = yield helper.createOrFindDemoProjectExperiment(project);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindDemoProjectExperiment: " + valOrError.error);
            let experiment = valOrError.val;
            assert.equal(experiment.name, demoProjectConf.demoProjectExperimentName);

            valOrError = yield helper.createOrFindAllDemoProcesses(project, experiment);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindAllDemoProcesses: " + valOrError.error);

            let mapEntry = demoProjectConf.outputSampleIndexMap[0];

            let processData = demoProjectConf.processesData[mapEntry.processIndex];
            let processName = processData.name;
            let templateId = processData.templateId;

            valOrError = yield helper.createOrFindDemoProcess(project, experiment, processName, templateId);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindDemoProcess: " + valOrError.error);

            let process = valOrError.val;

            let sampleIndexList = mapEntry.sampleIndexList;
            let sampleNames = [];
            for (let i = 0; i < sampleIndexList.length; i++) {
                sampleNames.push(demoProjectConf.sampleNameData[sampleIndexList[i]]);
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

            valOrError = yield helper.createOrFindDemoProcess(project, experiment, processName, templateId);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindDemoProcess: " + valOrError.error);

            process = valOrError.val;

            processData = demoProjectConf.processesData[0];
            let measurement = processData.measurements[0];

            valOrError = yield helper.updateMeasurementForProcessSamples(process, measurement);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindMeasurement: " + valOrError.error);

            samples = valOrError.val;
            let sample = samples[0];
            let updatedProcess = null;
            sample.processes.forEach((probe) => {
                if (probe.id == process.id) {
                    updatedProcess = probe;
                }
            });

            let updatedmeasurement = updatedProcess.measurements[0];

            assert.equal(measurement.attribute, updatedmeasurement.attribute);
            assert.equal(measurement.name, updatedmeasurement.name);
            assert.equal(measurement.otype, updatedmeasurement.otype);
            assert.equal(measurement.unit, updatedmeasurement.unit);
            assert.lengthOf(updatedmeasurement.value, measurement.value.length);
            for (let i = 0; i < measurement.value.length; i++) {
                assert.equal(updatedmeasurement.value[i].element, measurement.value[i].element)
                assert.equal(updatedmeasurement.value[i].value, measurement.value[i].value)
            }

        });
        it('find and attache the demo-project files to project', function*() {
            let user = yield dbModelUsers.getUser(demoProjectTestUserId);
            assert.equal(user.id, demoProjectTestUserId);

            let valOrError = yield helper.createOrFindDemoProjectForUser(user);
            assert.isUndefined(valOrError.error, "Unexpected error from createDemoProjectForUser: " + valOrError.error);
            let project = valOrError.val;
            assert.equal(project.name, demoProjectConf.demoProjectName);

            yield helper.addAllFilesToProject(user, project,demoProjectConf.datapathPrefix);
            let files = yield helper.filesForProject(project);
            assert.lengthOf(files, helper.filesDescriptions().length);

            let missingFiles = yield helper.filesMissingInDatabase(project,demoProjectConf.datapathPrefix);
            assert.lengthOf(missingFiles, 0);
        });
        it('add the demo-project files to the experiment', function*() {
            let user = yield dbModelUsers.getUser(demoProjectTestUserId);

            let valOrError = yield helper.createOrFindDemoProjectForUser(user);
            assert.isUndefined(valOrError.error, "Unexpected error from createDemoProjectForUser: " + valOrError.error);
            let project = valOrError.val;

            valOrError = yield helper.createOrFindDemoProjectExperiment(project);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindDemoProjectExperiment: " + valOrError.error);
            let experiment = valOrError.val;

            yield helper.addAllFilesToProject(user, project,demoProjectConf.datapathPrefix);
            let files = yield helper.filesForProject(project);

            assert.lengthOf(files,demoProjectConf.checksumsFilesAndMimiTypes.length, "Files set is complete");
            for (let i = 0; i < demoProjectConf.checksumsFilesAndMimiTypes.length; i++) {
                let checksum = demoProjectConf.checksumsFilesAndMimiTypes[i][0];
                let file = files[i];
                assert.equal(checksum,file.checksum,`Checksum for file: '${file.name}'`);
            }

            valOrError = yield helper.createOrFindAllDemoProcesses(project, experiment);
            assert.isUndefined(valOrError.error, "Unexpected error from createOrFindAllDemoProcesses: " + valOrError.error);

            let processes = valOrError.val;

            valOrError = yield helper.addAllFilesToExperimentProcesses(project,experiment,processes,files);
            assert.isUndefined(valOrError.error, "Unexpected error from addAllFilesToExperimentProcesses: " + valOrError.error);

            let updatedProcesses = valOrError.val;

            assert.lengthOf(updatedProcesses, processes.length,"Processes with files added");
            for (let processIndex = 0; processIndex < demoProjectConf.processFileIndexList.length; processIndex++) {
                let process = updatedProcesses[processIndex];
                let fileIndexes = demoProjectConf.processFileIndexList[processIndex];
                let expectedFiles = [];
                fileIndexes.forEach ((index) => {
                    expectedFiles.push(files[index])
                });
                let processFileTable = {};
                let processFiles = process.files;
                processFiles.forEach((file) =>{
                    processFileTable[file.checksum] = file;
                });
                expectedFiles.forEach((expectedFile) => {
                    let matchingFile = processFileTable[expectedFile.checksum];
                    assert.ok(matchingFile,`Expecting file '${expectedFile.name}' in process '${process.name}'`);
                    assert.equal(expectedFile.id,matchingFile.id);
                });
            }
        });
    });
    describe('Complete demo project', function () {
        it('buid',function*(){

            this.timeout(5000); // this test can take up to 5 seconds

            let user = yield dbModelUsers.getUser(demoProjectTestUserId);
            assert.equal(user.id, demoProjectTestUserId);


            let valOrError = yield buildDemoProject.findOrBuildAllParts(user,demoProjectConf.datapathPrefix);
            assert.isUndefined(valOrError.error, "Unexpected error from createDemoProjectForUser: " + valOrError.error);
            let results = valOrError.val;
            let project = results.project;
            let experiment = results.experiment;
            let processes = results.processes;
            let samples = results.samples;
            let files = results.files;

            assert.equal(project.name, demoProjectConf.demoProjectName);
            assert(project.description.includes(demoProjectConf.demoProjectDescription));
            assert.equal(project.owner, demoProjectTestUserId);

            assert.equal(experiment.name, demoProjectConf.demoProjectExperimentName);
            assert(experiment.description.includes(demoProjectConf.demoProjectExperimentDescription));
            assert.equal(experiment.owner, demoProjectTestUserId);

            assert.lengthOf(processes, demoProjectConf.processesData.length);
            for (let i = 0; i < demoProjectConf.processesData.length; i++) {
                let processData = demoProjectConf.processesData[i];
                let processName = processData.name;

                let process = processes[i];
                assert.equal(process.otype, "process");
                assert.equal(process.name, processName);
            }

            assert.lengthOf(samples, demoProjectConf.sampleNameData.length);
            for (let i = 0; i < demoProjectConf.sampleNameData.length; i++) {
                let sample = samples[i];
                let name = demoProjectConf.sampleNameData[i];
                assert.equal(name, sample.name);
            }

            assert.lengthOf(files, helper.filesDescriptions().length);

            let missingFiles = yield helper.filesMissingInDatabase(project,demoProjectConf.datapathPrefix);
            assert.lengthOf(missingFiles, 0);

        });
    });
});
