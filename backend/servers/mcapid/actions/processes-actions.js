const {Action, api} = require('actionhero');
const dal = require('@dal');

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
        let process = await dal.tryCatch(async() => await api.mc.processes.createProcess(params.project_id, params.experiment_id, params.name, user.id, params.attributes));
        if (!process) {
            throw new Error(`Unable to create process`);
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