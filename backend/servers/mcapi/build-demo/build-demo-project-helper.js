const fs = require('fs');
const os = require('os');
const promise = require('bluebird');
const md5File = promise.promisify(require('md5-file'));
const copy = require('copy');
const copyOne = promise.promisify(copy.one);

const resourcesProjectsExperimentsProcesses =
    require('../resources/projects/experiments/processes');
const dbModelProjects = require('../db/model/projects');
const dbModelExperiments = require('../db/model/experiments');
const dbModelProcesses = require('../db/model/processes');
const dbModelSamples = require('../db/model/samples');
const dbModelDirectories = require('../db/model/directories');
const fileUtils = require('../../lib/create-file-utils');

const demoProjectConf = require('./build-demo-project-conf');

function* createOrFindDemoProjectForUser(user) {
    // Note create project returns the project if it already exists, by name
    // It does not create a duplicate!
    let attributes = {
        name: demoProjectConf.demoProjectName,
        description: demoProjectConf.demoProjectDescription
    };
    // ret == val.ok_val or error.error
    return yield dbModelProjects.createProject(user, attributes);
}

function* createOrFindDemoProjectExperiment(project) {
    let experimentName = demoProjectConf.demoProjectExperimentName;
    let experimentDescription = demoProjectConf.demoProjectExperimentDescription;
    let ret = yield dbModelExperiments.getAllForProject(project.id);
    if (ret.val) {
        let experiment = null;
        let experiments = ret.val;
        experiments.forEach((e) => {
            if (e.name == experimentName) {
                experiment = e;
            }
        });
        if (experiment) {
            ret = {val: experiment}
        } else {
            let args = {
                project_id: project.id,
                name: experimentName,
                description: experimentDescription
            };
            ret = yield dbModelExperiments.create(args, project.owner);
        }
    }
    // ret == val.ok_val or error.error
    return ret;
}

function* createOrFindDemoProcess(project, experiment, processName, templateId) {
    let simple = true;
    let ret = yield dbModelExperiments.getProcessesForExperiment(experiment.id, simple);
    if (!ret.error) {
        let processes = ret.val;
        let nameMatchProcess = null;
        processes.forEach((process) => {
            if (process.name == processName) {
                nameMatchProcess = process;
            }
        });
        if (!nameMatchProcess) {
            ret = yield dbModelExperiments.addProcessFromTemplate(project.id, experiment.id, templateId, project.owner);
            if (!ret.error) {
                let process = ret.val;
                let args = {name: processName, files: [], properties: [], samples: []};
                ret = yield dbModelProcesses.updateProcess(process.id, args);
            }
        } else {
            ret.val = nameMatchProcess;
        }
    }
    // ret == val.ok_val or error.error
    return ret;
}

function* createOrFindAllDemoProcesses(project, experiment) {
    let ret = {error: "unknown error in createOrFindAllDemoProcesses"};
    let processes = [];

    for (let i = 0; i < demoProjectConf.processesData.length; i++) {
        let processData = demoProjectConf.processesData[i];
        let processName = processData.name;
        let templateId = processData.templateId;

        ret = yield createOrFindDemoProcess(project, experiment, processName, templateId);
        if (ret.error) {
            break;
        }
        let process = ret.val;
        processes.push(process);
    }

    if (!ret.error) {
        ret.val = processes;
    }

    // ret == val.ok_val or error.error
    return ret;
}
function* createOrFindProcessOutputSamples(project, experiment, process, sampleNameList) {
    let resultsingSamples = [];
    let copyOfNames = sampleNameList.slice();
    let ret = yield dbModelProcesses.getProcess(process.id);
    if (!ret.error) {
        let detailedProcess = ret.val;
        let outputSamples = detailedProcess.output_samples;
        for (let i = 0; i < outputSamples.length; i++) {
            let sample = outputSamples[i];
            let loc = copyOfNames.indexOf(sample.name);
            if (loc > -1) {
                copyOfNames.splice(loc, 1);
                resultsingSamples.push(sample);
            }
        }
        if (copyOfNames.length > 0) {
            let sampleNameArgs = [];
            copyOfNames.forEach((name) => {
                sampleNameArgs.push({name: name});
            });
            ret = yield dbModelSamples.createSamples(project.id, process.id, sampleNameArgs, project.owner);
            if (!ret.error) {
                let samples = ret.val.samples;
                resultsingSamples = resultsingSamples.concat(samples);
                let idList = [];
                samples.forEach((sample) => {
                    idList.push(sample.id);
                });
                ret = yield dbModelExperiments.addSamples(experiment.id, idList);
            }
        }
    }
    if (!ret.error) {
        let output = [];
        sampleNameList.forEach((name) => {
            resultsingSamples.forEach((sample) => {
                if (name == sample.name) {
                    output.push(sample);
                }
            });
        });
        ret.val = output;
    }
    return ret
}

function* createOrFindOutputSamplesForAllProcesses(project, experiment, processList, sampleNameList, map) {

    let ret = {error: "Failure in 'createOrFindOutputSamplesForAllProcesses'"};
    let outputSampleList = [];

    for (let mapIndex = 0; mapIndex < map.length; mapIndex++) {
        let mapEntry = map[mapIndex];

        let process = processList[mapEntry.processIndex];

        let sampleIndexList = mapEntry.sampleIndexList;
        let sampleNames = [];
        for (let i = 0; i < sampleIndexList.length; i++) {
            sampleNames.push(demoProjectConf.sampleNameData[sampleIndexList[i]]);
        }

        ret = yield createOrFindProcessOutputSamples(project, experiment, process, sampleNames);
        if (!ret.error) {
            let samples = ret.val;
            samples.forEach((sample) => {
                outputSampleList.push(sample)
            })
        }
    }
    if (!ret.error) {
        ret.val = outputSampleList;
    }
    return ret;
}

function* createOrFindInputSamplesForProcess(project, experiment, process, sampleList) {
    let resultsingSamples = [];
    let ret = yield dbModelProcesses.getProcess(process.id);
    if (!ret.error) {
        process = ret.val;
        if (process.input_samples.length > 0) {
            resultsingSamples = process.input_samples;
        }
        if (resultsingSamples.length != sampleList.length) {
            let samplesData = [];
            sampleList.forEach((sample) => {
                let found = false;
                if (resultsingSamples.length > 0) {
                    resultsingSamples.forEach((foundSample) => {
                        if (foundSample.id == sample.id) {
                            found = true;
                        }
                    });
                }
                if (!found) {
                    samplesData.push({
                        command: 'add',
                        id: sample.id,
                        property_set_id: sample.property_set_id
                    })
                }
            });
            if (samplesData.length > 0) {
                let args = {
                    template_id: process.template_id,
                    process_id: process.id,
                    samples: samplesData
                };
                let params = {
                    project_id: project.id,
                    experiment_id: experiment.id,
                    process_id: process.id
                };
                let errors = yield resourcesProjectsExperimentsProcesses
                    .validateUpdateExperimentProcessTemplateArgs(args, params);
                if (errors != null) {
                    ret = errors;
                } else {
                    let properties = [];
                    let files = [];
                    let samples = args.samples;
                    ret = yield dbModelExperiments.updateProcess(experiment.id, process.id,
                        properties, files, samples);
                    resultsingSamples = ret.val.input_samples;
                }
            }
        }
    }
    if (!ret.error) {
        ret.val = resultsingSamples;
    }
    return ret;
}

function* createOrFindInputSamplesForAllProcesses(project, experiment, processes, samples, map) {

    let ret = {error: "Failure in 'createOrFindInputSamplesForAllProcesses'"};
    let inputSampleList = [];

    for (let i = 0; i < map.length; i++) {
        let mapEntry = demoProjectConf.inputSampleIndexMap[i];
        let process = processes[mapEntry.processIndex];
        let sampleList = [];
        let sampleIndexList = mapEntry.sampleIndexList;

        sampleIndexList.forEach((index) => {
            sampleList.push(samples[index]);
        });

        ret = yield createOrFindInputSamplesForProcess(project, experiment, process, sampleList);
        if (ret.error) {
            break;
        }
        inputSampleList.push(ret.val);
    }

    if (!ret.error) {
        ret.val = inputSampleList;
    }

    return ret;
}

function* createOrFindDemoProcessSetupProperties(project, experiment, process, propList) {
    let ret = {error: "unexpected error in createOrFindDemoProcessSetupProperties"};
    let args = {
        template_id: process.template_id,
        process_id: process.id,
        properties: propList
    };
    let params = {
        project_id: project.id,
        experiment_id: experiment.id,
        process_id: process.id
    };
    let errors = yield resourcesProjectsExperimentsProcesses
        .validateUpdateExperimentProcessTemplateArgs(args, params);
    if (errors != null) {
        ret = {error: errors};
    } else {
        let properties = args.properties;
        let files = [];
        let samples = [];
        ret = yield dbModelExperiments.updateProcess(experiment.id, process.id,
            properties, files, samples);
        if (!ret.error) {
            ret = yield dbModelProcesses.getProcess(process.id);
        }
    }
    return ret;
}

function* createOrFindSetupPropertiesForAllDemoProcesses(project, experiment, processes) {
    let ret = {error: "unexpected error in createOrFindSetupPropertiesForAllDemoProcesses"};

    let templateTable = yield makeTemplateTable();

    for (let processIndex = 0; processIndex < processes.length; processIndex++) {

        let process = processes[processIndex];
        let templateId = process['template_id'];
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

        let valuesForSetup = demoProjectConf.processesData[processIndex].properties;

        if (valuesForSetup && valuesForSetup.length > 0) {

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
            });

            ret = yield createOrFindDemoProcessSetupProperties(project, experiment, process, args);
            if (ret.error) {
                break;
            }
        }
    }

    if (!ret.error) {
        ret = yield createOrFindAllDemoProcesses(project, experiment);
    }

    return ret;
}

function* updateMeasurementForProcessSamples(process, measurement) {
    let samples = process.output_samples;
    let samplesArg = [];
    samples.forEach((sample) => {
        samplesArg.push({id: sample.id, property_set_id: sample.property_set_id});
    });
    let propertyArg = {
        name: measurement.name,
        attribute: measurement.attribute
    };

    let propertiesArg = [{
        add_as: 'seperate',
        samples: samplesArg,
        property: propertyArg,
        measurements: [measurement]
    }];

    let ret = yield dbModelSamples.addSamplesMeasurements(process.id, propertiesArg);

    if (!ret.error) {
        let samplesToReturn = [];
        for (let i = 0; i < samples.length; i++) {
            if (!ret.error) {
                ret = yield dbModelSamples.getSample(samples[i].id);
                if (!ret.error) {
                    let sample = ret.val;
                    samplesToReturn.push(sample);
                }
            }
        }
        if (!ret.error) {
            ret.val = samplesToReturn;
        }
    }
    return ret;
}

function filesDescriptions() {
    return demoProjectConf.checksumsFilesAndMimiTypes;
}

function* filesMissingInFolder(datapathPrefix) {
    let ret = [];
    for (let i = 0; i < filesDescriptions().length; i++) {
        let checksumAndFilename = filesDescriptions()[i];
        let expectedChecksum = checksumAndFilename[0];
        let filename = checksumAndFilename[1];
        let path = datapathPrefix + `${demoProjectConf.datapath}/${filename}`;
        let ok = false;
        if (fs.existsSync(path)) {
            let checksum = yield md5File(path);
            if (checksum == expectedChecksum) {
                ok = true;
            }
        }
        if (!ok) {
            ret.push(filename);
        }
    }
    return ret;
}

function* filesMissingInDatabase(project) {
    let files = yield filesForProject(project);
    let table = {};
    files.forEach((file) => {
        table[file.checksum] = file;
    });

    let ret = [];
    filesDescriptions().forEach((fileDescription) => {
        let expectedChecksum = fileDescription[0];
        let filename = fileDescription[1];
        let ok = table[expectedChecksum];
        if (!ok) {
            ret.push(filename);
        }
    });
    return ret;
}

function* addAllFilesToProject(user, project, datapathPrefix) {
    let top_directory = yield dbModelDirectories.get(project.id, 'top');
    let tempDir = os.tmpdir();
    for (let i = 0; i < filesDescriptions().length; i++) {
        let checksumFilenameAndMimetype = filesDescriptions()[i];
        let expectedChecksum = checksumFilenameAndMimetype[0];
        let filename = checksumFilenameAndMimetype[1];
        let mimetype = checksumFilenameAndMimetype[2];
        let path = datapathPrefix + `${demoProjectConf.datapath}/${filename}`;
        let checksum = yield md5File(path);
        if (expectedChecksum == checksum) {
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
            yield dbModelDirectories.ingestSingleLocalFile(project.id, top_directory.id, user.id, args);
        }
    }
}

function* filesForProject(project) {
    let top_directory = yield dbModelDirectories.get(project.id, 'top');
    let children = top_directory.children;
    let files = [];
    for (let i = 0; i < children.length; i++) {
        let fileOrDir = children[i];
        if (fileOrDir.otype == 'file') files.push(fileOrDir);
    }
    files = restoreProjectSourceOrderToFiles(files);
    return files;
}

function restoreProjectSourceOrderToFiles(files){
    let returnFileList = [];
    let fileTable = {};
    files.forEach((file) => {
        fileTable[file.checksum] = file;
    });
    demoProjectConf.checksumsFilesAndMimiTypes.forEach((fileEntry) => {
        let checksum = fileEntry[0];
        returnFileList.push(fileTable[checksum]);
    });
    return returnFileList;
}

function* addAllFilesToExperimentProcesses(project,experiment,processes,files) {
    let ret = {error: "unexpected error in createOrFindDemoProcessSetupProperties"};
    let processesToReturn = [];
    for (let processIndex = 0; processIndex < demoProjectConf.processFileIndexList.length; processIndex++) {
        let process = processes[processIndex];
        let fileIndexes = demoProjectConf.processFileIndexList[processIndex];
        let filesArg = [];
        for (let i = 0; i < fileIndexes.length; i++) {
            let file = files[fileIndexes[i]];
            filesArg.push({command: 'add', id: file.id});
        }
        // Note: no duplication of redundent files
        let args = {
            template_id: process.template_id,
            process_id: process.id,
            files: filesArg
        };
        let params = {
            project_id: project.id,
            experiment_id: experiment.id,
            process_id: process.id
        };
        let errors = yield resourcesProjectsExperimentsProcesses
            .validateUpdateExperimentProcessTemplateArgs(args, params);
        if (errors != null) {
            ret = {error: errors};
        } else {
            let properties = [];
            let files = args.files;
            let samples = [];
            ret = yield dbModelExperiments.updateProcess(experiment.id, process.id,
                properties, files, samples);
        }
        if (!ret.error) {
            ret = yield dbModelProcesses.getProcess(process.id);
            if (!ret.error) {
                let process = ret.val;
                processesToReturn.push(process);
            }
        }
        if (ret.error) break;
    }
    if (!ret.error) {
        ret.val = processesToReturn;
    }
    return ret;
}

function* makeTemplateTable() {
    let ret = yield dbModelProcesses.getProcessTemplates();
    let table = {};
    if (ret.val) {
        let templates = ret.val;
        templates.forEach((template) => {
            table[template.id] = template;
        });
    }
    return table;
}

module.exports = {
    createOrFindDemoProjectForUser,
    createOrFindDemoProjectExperiment,
    createOrFindDemoProcess,
    createOrFindAllDemoProcesses,
    createOrFindProcessOutputSamples,
    createOrFindOutputSamplesForAllProcesses,
    createOrFindInputSamplesForProcess,
    createOrFindInputSamplesForAllProcesses,
    createOrFindDemoProcessSetupProperties,
    createOrFindSetupPropertiesForAllDemoProcesses,
    updateMeasurementForProcessSamples,
    filesDescriptions,
    filesMissingInFolder,
    filesMissingInDatabase,
    addAllFilesToProject,
    filesForProject,
    addAllFilesToExperimentProcesses,
    makeTemplateTable
};