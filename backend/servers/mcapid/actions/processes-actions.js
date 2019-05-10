const {Action, api} = require('actionhero');
const dal = require('@dal');
const joi = require('joi');
const _ = require('lodash');

module.exports.GetProcessesForProjectAction = class GetProcessesForProjectAction extends Action {
    constructor() {
        super();
        this.name = 'getProcessesForProject';
        this.description = 'Returns all processes in the given project';
        this.inputs = {
            project_id: {
                required: true,
            }
        };
        this.outputExample = {
            data: [processExample.data],
            serverInformation: processExample.serverInformation,
            requesterInformation: processExample.requesterInformation
        };
    }

    async run({response, params}) {
        const results = await dal.tryCatch(async() => await api.mc.processes.getProcessesForProject(params.project_id));
        if (results === null) {
            throw new Error(`Unable to retrieve processes for project ${params.project_id}`);
        }
        response.data = results;
    }
};

module.exports.GetProcessesForExperimentAction = class GetProcessesForExperimentAction extends Action {
    constructor() {
        super();
        this.name = 'getProcessesForExperiment';
        this.description = 'Returns all processes in the given experiment';
        this.inputs = {
            project_id: {
                required: true,
            },

            experiment_id: {
                required: true,
            }
        };

        this.outputExample = {
            data: [processExample.data],
            serverInformation: processExample.serverInformation,
            requesterInformation: processExample.requesterInformation
        };
    }

    async run({response, params}) {
        const results = await dal.tryCatch(async() => await api.mc.processes.getProcessesForExperiment(params.experiment_id));
        if (results === null) {
            throw new Error(`Unable to retrieve processes for experiment`);
        }
        response.data = results;
    }
};

module.exports.GetProcessForProjectAction = class GetProcessForProjectAction extends Action {
    constructor() {
        super();
        this.name = 'getProcessForProject';
        this.description = 'Returns process in project';
        this.inputs = {
            project_id: {
                required: true,
            },

            process_id: {
                required: true,
            }
        };
        this.outputExample = processExample;
    }

    async run({response, params}) {
        const results = await dal.tryCatch(async() => await api.mc.processes.getProcessForProject(params.project_id, params.process_id));
        if (!results) {
            throw new Error(`Unable to retrieve process ${params.process_id} for project ${params.project_id}`);
        }
        response.data = results;
    }
};

module.exports.GetProcessAction = class GetProcessAction extends Action {
    constructor() {
        super();
        this.name = 'getProcess';
        this.description = 'Return the given process';
        this.inputs = {
            process_id: {
                required: true
            }
        };
        this.outputExample = processExample;
    }

    async run({response, params, user}) {
        const results = await dal.tryCatch(async() => await api.mc.processes.getProcess(user.id, params.process_id));
        if (!results) {
            throw new Error(`Unable to retrieve process ${params.process_id}`);
        }
        response.data = results;
    }
};

module.exports.AddFilesToProcessAction = class AddFilesToProcessAction extends Action {
    constructor() {
        super();
        this.name = 'addFilesToProcess';
        this.description = 'Adds files to a process';
        this.fileSchema = {
            file_id: joi.string().guid({version: ['uuidv4']}),
            direction: joi.any().valid('in', 'out')
        };

        this.inputs = {
            project_id: {
                required: true,
            },

            process_id: {
                required: true,
            },

            files: {
                required: true,
                validator: files => {
                    if (!_.isArray(files)) {
                        throw new Error('files must be an array');
                    }

                }
            }
        };
    }

    async run({response, params}) {
        if (!await api.mc.check.processInProject(params.process_id, params.projectId)) {
            throw new Error(`process is not in project`);
        }

        let fileIds = params.files.map(s => s.file_id);
        if (!await api.mc.check.allFilesInProject(fileIds, params.project_id)) {
            throw new Error(`1 or more samples are not in project`);
        }

        let result = await dal.tryCatch(async() => await api.mc.files.updateProcessFiles(params.process_id, params.files));
        if (!result) {
            throw new Error(`Unable to add one or more files to process`);
        }

        let process = await dal.tryCatch(async() => await api.mc.processes.getProcessForProject(params.project_id, params.process_id));

        if (!process) {
            throw new Error('Unable to retrieve updated process');
        }

        response.data = process;
    }
};

module.exports.RemoveFilesFromProcessAction = class RemoveFilesFromProcessAction extends Action {
    constructor() {
        super();
        this.name = 'removeFilesFromProcess';
        this.description = 'Removes files from process';
        this.inputs = {
            project_id: {
                required: true,
            },

            process_id: {
                required: true,
            },

            files: {
                required: true,
                validator: files => {
                    if (!_.isArray(files)) {
                        throw new Error('files must be an array');
                    }
                }
            }
        };
    }

    async run({response, params}) {
        if (!await api.mc.check.processInProject(params.process_id, params.projectId)) {
            throw new Error(`process is not in project`);
        }

        if (!await api.mc.check.allFilesInProject(file, params.project_id)) {
            throw new Error(`1 or more samples are not in project`);
        }

        let result = await dal.tryCatch(async() => await api.mc.processes.removeFilesFromProcess(params.files, params.process_id));
        if (!result) {
            throw new Error(`Unable to remove files from process`);
        }

        let process = await dal.tryCatch(async() => await api.mc.processes.getProcessForProject(params.project_id, params.process_id));

        if (!process) {
            throw new Error('Unable to retrieve updated process');
        }

        response.data = process;
    }
};

module.exports.AddSamplesToProcessAction = class AddSamplesToProcessAction extends Action {
    constructor() {
        super();
        this.name = 'addSamplesToProcess';
        this.description = 'Adds samples to a process';

        this.sampleSchema = {
            sample_id: joi.string().guid({version: ['uuidv4']}),
            property_set_id: joi.string().guid({version: ['uuidv4']}),
            transform: joi.boolean(),
        };

        this.inputs = {
            project_id: {
                required: true,
            },

            process_id: {
                required: true,
            },

            samples: {
                required: true,
                validator: samples => {
                    if (!_.isArray(samples)) {
                        throw new Error('samples must be an array');
                    }

                    for (let sample of samples) {
                        let result = joi.validate(sample, this.sampleSchema);
                        if (result.error !== null) {
                            throw new Error(`Invalid sample ${result.error}`);
                        }
                    }
                }
            },

            create_samples: {
                default: [],
            }
        };
    }

    async run({response, params, user}) {
        if (!await api.mc.check.processInProject(params.process_id, params.project_id)) {
            throw new Error(`process is not in project`);
        }

        let sampleIds = params.samples.map(s => s.sample_id);
        if (!await api.mc.check.allSamplesInProject(sampleIds, params.project_id)) {
            throw new Error(`1 or more samples are not in project`);
        }

        let transformSamples = params.samples.filter(s => s.transform);
        if (transformSamples.length) {
            let result = await dal.tryCatch(async() => await api.mc.samples.addSamplesToProcess(transformSamples, params.process_id, true));
            if (!result) {
                throw new Error(`Unable to add one or more samples to process`);
            }
        }

        let otherSamples = params.samples.filter(s => !s.transform);
        if (otherSamples.length) {
            let result = await dal.tryCatch(async() => await api.mc.samples.addSamplesToProcess(otherSamples, params.process_id, false));
            if (!result) {
                throw new Error(`Unable to add one or more samples to process`);
            }
        }

        if (params.create_samples.length) {
            let createError = false;
            for (let s of params.create_samples) {
                let result = await dal.tryCatch(async() => await api.mc.samples.createSampleInProcess(s, '', user.id, params.process_id, params.project_id));
                if (!result) {
                    createError = true;
                }
            }

            if (createError) {
                errors.push(`Unable to create 1 or more samples`);
            }
        }

        let process = await dal.tryCatch(async() => await api.mc.processes.getProcessForProject(params.project_id, params.process_id));

        if (!process) {
            throw new Error('Unable to retrieve updated process');
        }

        response.data = process;
    }
};

module.exports.RemoveSamplesFromProcessAction = class RemoveSamplesFromProcessAction extends Action {
    constructor() {
        super();
        this.name = 'removeSamplesFromProcess';
        this.description = 'Removes samples from process';

        this.sampleSchema = {
            sample_id: joi.string().guid({version: ['uuidv4']}),
            property_set_id: joi.string().guid({version: ['uuidv4']}),
        };

        this.inputs = {
            project_id: {
                required: true,
            },

            process_id: {
                required: true,
            },

            samples: {
                required: true,
                validator: samples => {
                    if (!_.isArray(samples)) {
                        throw new Error('samples must be an array');
                    }

                    for (let sample of samples) {
                        let result = joi.validate(sample, this.sampleSchema);
                        if (result.error !== null) {
                            throw new Error(`Invalid sample ${result.error}`);
                        }
                    }
                }
            }
        };
    }

    async run({response, params}) {
        if (!await api.mc.check.processInProject(params.process_id, params.projectId)) {
            throw new Error(`process is not in project`);
        }

        let sampleIds = params.samples.map(s => s.sample_id);
        if (!await api.mc.check.allSamplesInProject(sampleIds, params.project_id)) {
            throw new Error(`1 or more samples are not in project`);
        }

        let result = await dal.tryCatch(async() => await api.mc.processes.removeSamplesFromProcess(params.samples, params.process_id));
        if (!result) {
            throw new Error(`Unable to remove samples from process`);
        }

        let process = await dal.tryCatch(async() => await api.mc.processes.getProcessForProject(params.project_id, params.process_id));

        if (!process) {
            throw new Error('Unable to retrieve updated process');
        }

        response.data = process;
    }
};

module.exports.CreateProcessAction = class CreateProcessAction extends Action {
    constructor() {
        super();
        this.name = 'createProcess';
        this.description = 'creates a new process';
        this.inputs = {
            project_id: {
                required: true,
            },

            name: {
                required: true,
            },

            experiment_id: {
                required: true,
            },

            attributes: {
                default: [],
            }
        };
    }

    async run({response, params, user}) {
        let process = await dal.tryCatch(async() => await api.mc.processes.createTransformProcessFromTemplate(params.project_id, params.experiment_id, params.name, user.id, params.attributes));
        if (!process) {
            throw new Error(`Unable to create process`);
        }

        response.data = process;
    }
};

module.exports.AddNewProcessAction = class AddNewProcessAction extends Action {
    constructor() {
        super();
        this.name = 'addNewProcess';
        this.description = 'adds a new process';

        this.sampleSchema = {
            sample_id: joi.string().guid({version: ['uuidv4']}),
            property_set_id: joi.string().guid({version: ['uuidv4']}),
            action: joi.any().valid('use', 'transform'),
        };

        this.fileSchema = {
            file_id: joi.string().guid({version: ['uuidv4']}),
            action: joi.any().valid('use', 'create'),
        };

        this.inputs = {
            project_id: {
                required: true,
            },

            experiment_id: {
                required: true,
            },

            name: {
                required: true,
            },

            attributes: {
                default: [],
            },

            samples: {
                default: [],
                validator: (samples) => {
                    if (!_.isArray(samples)) {
                        throw new Error('samples must be an array');
                    }

                    for (let sample of samples) {
                        let result = joi.validate(sample, this.sampleSchema);
                        if (result.error !== null) {
                            throw new Error(`Invalid sample ${result.error}`);
                        }
                    }
                }
            },

            create_samples: {
                default: [],
            },

            files: {
                default: [],
                validator: (files) => {
                    if (!_.isArray(files)) {
                        throw new Error('files must be an array');
                    }

                    for (let file of files) {
                        let result = joi.validate(file, this.fileSchema);
                        if (result.error !== null) {
                            throw new Error(`Invalid file ${result.error}`);
                        }
                    }
                },
            }
        };
    }

    async run({response, params, user}) {
        if (!await api.mc.check.experimentInProject(params.experiment_id, params.project_id)) {
            throw new Error(`Experiment ${params.experiment_id} not in project ${params.project_id}`);
        }

        const sampleIds = params.samples.map(s => s.sample_id);
        if (!await api.mc.check.allSamplesInProject(sampleIds, params.project_id)) {
            throw new Error(`Not all samples in project`);
        }

        const fileIds = params.files.map(f => f.file_id);
        if (!await api.mc.check.allFilesInProject(fileIds, params.project_id)) {
            throw new Error(`Not all files in project`);
        }

        const {project_id, experiment_id, name, attributes} = params;
        const processId = await dal.tryCatch(async() => await api.mc.processes.createProcess(project_id, experiment_id, name, user.id, attributes));
        if (!processId) {
            throw new Error(`Unable to create process`);
        }

        /*
        ** The following set of operations can partially complete. Because we can't back out at this point we track whether any
        ** error occurred during using/creating/transforming samples and using/creating files. If an error does occur we append
        ** a message to the errors array. At the end if the errors array is not empty we add it to the resulting process to let
        ** the user know that some errors did occur.
         */

        let result, errors = [];

        // perform file operations

        const files = params.files.map(f => {
            if (f.action === 'use') {
                return {
                    file_id: f.file_id,
                    direction: 'in',
                };
            } else {
                // f.action === 'create'
                return {
                    file_id: f.file_id,
                    direction: 'out'
                };
            }
        });

        if (files.length) {
            result = await dal.tryCatch(async() => await api.mc.files.updateProcessFiles(processId, files));
            if (!result) {
                errors.push(`Unable to add 1 or more files`);
            }
        }

        // perform sample operations

        const transformSamples = params.samples.filter(s => s.action === 'transform');
        if (transformSamples.length) {
            result = await dal.tryCatch(async() => await api.mc.samples.addSamplesToProcess(transformSamples, processId, true));
            if (!result) {
                errors.push(`Unable to transform 1 or more samples`);
            }
        }

        const useSamples = params.samples.filter(s => s.action === 'use');
        if (useSamples.length) {
            result = await dal.tryCatch(async() => await api.mc.samples.addSamplesToProcess(useSamples, processId, false));
            if (!result) {
                errors.push(`Unable to add 1 or more samples`);
            }
        }

        let createError = false;
        for (let s of params.create_samples) {
            result = await dal.tryCatch(async() => await api.mc.samples.createSampleInProcess(s, '', user.id, processId, project_id));
            if (!result) {
                createError = true;
            }
        }

        if (createError) {
            errors.push(`Unable to create 1 or more samples`);
        }

        const process = await dal.tryCatch(async() => await api.mc.processes.getProcess(user.id, processId));
        if (!process) {
            throw new Error(`Unable to retrieve created process`);
        }

        if (errors.length) {
            process.errors = errors;
        }

        response.data = process;
    }
};

const processExample = {
    'data': {
        'birthtime': '2019-02-08T21:14:08.250Z',
        'category': 'create_sample',
        'does_transform': true,
        'files': [],
        'id': '3b4ed029-15d8-4d78-aba6-b5d9d424e5ea',
        'measurements': [],
        'mtime': '2019-02-08T21:14:08.250Z',
        'name': 'Create Samples',
        'note': '',
        'otype': 'process',
        'owner': 'test@test.mc',
        'process_id': '3b4ed029-15d8-4d78-aba6-b5d9d424e5ea',
        'process_type': 'create',
        'project_id': 'c667f810-6202-4f7f-9460-81029dac0840',
        'samples': [
            {
                'birthtime': '2019-02-08T21:14:08.955Z',
                'description': '',
                'direction': 'out',
                'group_size': 0,
                'has_group': false,
                'id': '39e19d00-955b-4ce4-96fe-01c6037b9fac',
                'is_grouped': false,
                'mtime': '2019-02-08T21:14:08.955Z',
                'name': 'Test Sample 1',
                'otype': 'sample',
                'owner': 'test@test.mc',
                'process_id': '3b4ed029-15d8-4d78-aba6-b5d9d424e5ea',
                'property_set_id': '2fa38864-f7be-43df-b6e1-8ec045f12b45',
                'sample_id': '39e19d00-955b-4ce4-96fe-01c6037b9fac'
            }
        ],
        'setup': [
            {
                'attribute': 'instrument',
                'birthtime': '2019-02-08T21:14:08.365Z',
                'id': '0ec0094d-7c6f-49fc-9ca2-58d78df0cb07',
                'name': 'Instrument',
                'otype': 'settings',
                'process_id': '3b4ed029-15d8-4d78-aba6-b5d9d424e5ea',
                'properties': [
                    {
                        'attribute': 'manufacturing_date',
                        'description': '',
                        'id': '357c0162-dc7e-4341-8fd6-b5c410f111d0',
                        'name': 'Manufacturing Date',
                        'otype': 'date',
                        'setup_id': '0ec0094d-7c6f-49fc-9ca2-58d78df0cb07',
                        'unit': '',
                        'value': ''
                    }
                ],
                'setup_id': '0ec0094d-7c6f-49fc-9ca2-58d78df0cb07'
            }
        ],
        'template_id': 'global_Create Samples',
        'template_name': 'Create Samples'
    },
    'serverInformation': {
        'serverName': 'mcapid',
        'apiVersion': '0.1.0',
        'requestDuration': 5,
        'currentTime': 1550087302651
    },
    'requesterInformation': {
        'id': 'b5bab012e4c01e99ca17a84cd91b8ee3fe9da853-bd9f9a70-2f34-4a01-b9e7-0a2252e8ae73',
        'fingerprint': 'b5bab012e4c01e99ca17a84cd91b8ee3fe9da853',
        'messageId': 'bd9f9a70-2f34-4a01-b9e7-0a2252e8ae73',
        'remoteIP': '127.0.0.1',
        'receivedParams': {
            'project_id': 'c667f810-6202-4f7f-9460-81029dac0840',
            'process_id': '3b4ed029-15d8-4d78-aba6-b5d9d424e5ea',
            'action': 'getProcessForProject'
        }
    }
};