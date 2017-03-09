const fs = require('fs');
const os = require('os')
const promise = require('bluebird');
const md5File = promise.promisify(require('md5-file'));
const copy = require('copy');
const copyOne = promise.promisify(copy.one);

const backend_base = '../..';
const resourcesProjectsExperimentsProcesses =
    require(backend_base + '/servers/mcapi/resources/projects/experiments/processes');
const dbModelProjects = require(backend_base + '/servers/mcapi/db/model/projects');
const dbModelExperiments = require(backend_base + '/servers/mcapi/db/model/experiments');
const dbModelProcesses = require(backend_base + '/servers/mcapi/db/model/processes');
const dbModelSamples = require(backend_base + '/servers/mcapi/db/model/samples');
const dbModelUsers = require(backend_base + '/servers/mcapi/db/model/users');
const dbModelDirectories = require(backend_base + '/servers/mcapi/db/model/directories');
const dbModelFiles = require(backend_base + '/servers/mcapi/db/model/files');
const resourceUsers = require(backend_base + '/servers/mcapi/resources/users');
const fileUtils = require(backend_base + '/servers/lib/create-file-utils');


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
            {attribute: "production_method", value: {name: "Cast", value: "cast"}},
            {attribute: 'manufacturer', value: 'Ohio State University'},
            {attribute: 'supplier', value: 'Ohio State University'}
        ],
        measurements: [
            {attribute: 'composition', name: 'Composition', otype: 'compostion', units: ["at%", "wt%", "atoms"]}
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

const setupProperties = [
    {
        processIndex: 0,
        properties: [
            {name: 'manufacturing_date', value: 1485977519347},           // February 1, 2017
            {name: 'manufacturer', value: 'Ohio State University'}
        ]
    },
    {
        processIndex: 3,
        properties: [
            {name: 'voltage', value: 31, unit: 'kV'},
            {name: 'sample_tilt', value: 70},
            {name: 'scan_size_width', value: 2500},
            {name: 'scan_size_height', value: 2500},
            {name: 'step_size', value: 1},
            {name: 'working_distance', value: 20}
        ]
    },
    {
        processIndex: 4,
        properties: [
            {name: 'voltage', value: 15, unit: 'kV'},
            {name: 'beam_current', value: 20, unit: 'nA'},
            {name: 'step_size', value: 10},
            {name: 'grid_dimensions', value: '20 x 20'},
            {name: 'location', value: 'center, mid-thickness'}
        ]
    }
];

const tiffMimeType = "image/tiff";
const jpegMimeType = "image/jpeg";
const textMimeTYpe = "text/plain";
const ppxtMimeType = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
const xlsxMimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const xdocMimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const checksumsFilesAndMimiTypes = [
    ['6817cb556bdea4e2a2cd79f8a0de2880', 'LIFT Specimen Die.jpg', jpegMimeType],
    ['c0e1b0a68cfbb42646e47ef31dd55eef', 'L124_photo.jpg', jpegMimeType],
    ['59b628fb2ba9bcc47680205f444b5035', 'LIFT HPDC Samplesv3.xlsx', xlsxMimeType],
    ['38016d2624995af5999aa318f634f795', 'Measured Compositions_EzCast_Lift380.pptx', ppxtMimeType],
    ['25bd13db179fef53dafaa6346610d367', 'GSD_Results_L124_MC.xlsx', xlsxMimeType],
    ['e6980644196b03930f79b793879e5159', 'Grain_Size_EBSD_L380_comp_5mm.tiff', tiffMimeType],
    ['3e73cdae8ad5f1bbef9875d7fec66e21', 'Grain_Size_EBSD_L380_comp_core.tiff', tiffMimeType],
    ['4b4f34a5254da1513fa7f6a33775e402', 'Grain_Size_EBSD_L380_comp_skin.tiff', tiffMimeType],
    ['0286b5cb1bb1b3f616d522c7b2ad4507', 'Grain_Size_Vs_Distance.tiff', tiffMimeType],
    ['cbca60338ebbc1578aaa0419276d5dcf', 'L124_plate_5mm_TT_GF2.txt', textMimeTYpe],
    ['6873750df1be392232d7c18b55fe5d6e', 'L124_plate_5mm_TT_IPF.tif', tiffMimeType],
    ['8ebabe85989a4bb8164174de57a637b9', 'EPMA_Analysis_L124_Al.tiff', tiffMimeType],
    ['ff74dfe74be2ea7f825a421872b7483b', 'EPMA_Analysis_L124_Cu.tiff', tiffMimeType],
    ['7d1bc051faa005244811f5272eea21f3', 'EPMA_Analysis_L124_Si.tiff', tiffMimeType],
    ['f62635987157cfadac8035e0dc6bccfa', 'ExperimentData_Lift380_L124_20161227.docx', xdocMimeType],
    ['d423248c056eff682f46181e0c912369', 'Samples_Lift380_L124_20161227.xlsx', xlsxMimeType]
];

const datapath = 'backend/scripts/demo-project/demo_project_data';

function* createOrFindDemoProjectForUser(user) {
    // Note create project returns the project if it already exists, by name
    // It does not create a duplicate!
    let attributes = {
        name: demoProjectName,
        description: demoProjectDescription
    };
    // ret == val.ok_val or error.error
    return yield dbModelProjects.createProject(user, attributes);
}

function* createOrFindDemoProjectExperiment(project) {
    let experimentName = demoProjectExperimentName;
    let experimentDescription = demoProjectExperimentDescription;
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

    for (let i = 0; i < processesData.length; i++) {
        let processData = processesData[i];
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
            sampleNames.push(sampleNameData[sampleIndexList[i]]);
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
                    resultsingSamples.each((foundSample) => {
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
        let mapEntry = inputSampleIndexMap[i];
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

        let valuesForSetup = processesData[processIndex].properties;

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
    return checksumsFilesAndMimiTypes;
}

function* filesMissingInFolder() {
    let ret = [];
    for (let i = 0; i < filesDescriptions().length; i++) {
        let checksumAndFilename = filesDescriptions()[i];
        let expectedChecksum = checksumAndFilename[0];
        let filename = checksumAndFilename[1];
        let path = `${datapath}/${filename}`;
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

function* addAllFiles(user, project) {
    let top_directory = yield dbModelDirectories.get(project.id, 'top');
    let tempDir = os.tmpdir();
    for (let i = 0; i < filesDescriptions().length; i++) {
        let checksumFilenameAndMimetype = filesDescriptions()[i];
        let expectedChecksum = checksumFilenameAndMimetype[0];
        let filename = checksumFilenameAndMimetype[1];
        let mimetype = checksumFilenameAndMimetype[2];
        let path = `${datapath}/${filename}`;
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
            let file = yield dbModelDirectories.ingestSingleLocalFile(project.id, top_directory.id, user.id, args);
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
    return files;
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
    addAllFiles,
    filesForProject,
    makeTemplateTable
};