const {Action} = require('actionhero');
const dal = require('../lib/dal');
const processes = require('../lib/dal/processes');

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
            'data': [
                {
                    'birthtime': '2019-02-08T21:14:09.172Z',
                    'category': '',
                    'does_transform': false,
                    'files': [],
                    'id': 'dbd2f437-ee9c-4837-9e11-da643e76bab8',
                    'measurements': [],
                    'mtime': '2019-02-08T21:14:09.172Z',
                    'name': 'Computation',
                    'note': '',
                    'otype': 'process',
                    'owner': 'test@test.mc',
                    'process_id': 'dbd2f437-ee9c-4837-9e11-da643e76bab8',
                    'process_type': 'analysis',
                    'project_id': 'c667f810-6202-4f7f-9460-81029dac0840',
                    'samples': [
                        {
                            'birthtime': '2019-02-08T21:14:08.955Z',
                            'description': '',
                            'direction': 'in',
                            'group_size': 0,
                            'has_group': false,
                            'id': '39e19d00-955b-4ce4-96fe-01c6037b9fac',
                            'is_grouped': false,
                            'mtime': '2019-02-08T21:14:08.955Z',
                            'name': 'Test Sample 1',
                            'otype': 'sample',
                            'owner': 'test@test.mc',
                            'process_id': 'dbd2f437-ee9c-4837-9e11-da643e76bab8',
                            'property_set_id': '2fa38864-f7be-43df-b6e1-8ec045f12b45',
                            'sample_id': '39e19d00-955b-4ce4-96fe-01c6037b9fac'
                        }
                    ],
                    'setup': [
                        {
                            'attribute': 'instrument',
                            'birthtime': '2019-02-08T21:14:09.359Z',
                            'id': '64f8e634-9046-4ce5-a0d6-f0f0a338f30e',
                            'name': 'Instrument',
                            'otype': 'settings',
                            'process_id': 'dbd2f437-ee9c-4837-9e11-da643e76bab8',
                            'properties': [
                                {
                                    'attribute': 'walltime',
                                    'description': '',
                                    'id': '30c782b6-b44d-4753-a9fb-2ebbd6cba363',
                                    'name': 'Walltime',
                                    'otype': 'number',
                                    'setup_id': '64f8e634-9046-4ce5-a0d6-f0f0a338f30e',
                                    'unit': '',
                                    'value': ''
                                }
                            ],
                            'setup_id': '64f8e634-9046-4ce5-a0d6-f0f0a338f30e'
                        }
                    ],
                    'template_id': 'global_Computation',
                    'template_name': 'Computation'
                },
                {
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
                }
            ],
            'serverInformation': {
                'serverName': 'mcapid',
                'apiVersion': '0.1.0',
                'requestDuration': 23,
                'currentTime': 1550082095172
            },
            'requesterInformation': {
                'id': '7e67280f2f022ad284c71fb319dd26ba81c4f03d-058d4379-b856-4330-8e48-cc3988e873ef',
                'fingerprint': '7e67280f2f022ad284c71fb319dd26ba81c4f03d',
                'messageId': '058d4379-b856-4330-8e48-cc3988e873ef',
                'remoteIP': '127.0.0.1',
                'receivedParams': {
                    'project_id': 'c667f810-6202-4f7f-9460-81029dac0840',
                    'action': 'getProcessesForProject'
                }
            }
        };
    }

    async run({response, params}) {
        const results = await dal.tryCatch(async() => await processes.getProcessesForProject(params.project_id));
        if (results === null) {
            throw new Error(`Unable to retrieve processes for project ${params.project_id}`);
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
        this.outputExample = {
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
    }

    async run({response, params}) {
        const results = await dal.tryCatch(async() => await processes.getProcessForProject(params.project_id, params.process_id));
        if (!results) {
            throw new Error(`Unable to retrieve process ${params.process_id} for project ${params.project_id}`);
        }
        response.data = results;
    }
};

// module.exports.ListProcessesAction = class ListProcessesAction extends Action {
//     constructor() {
//         super();
//         this.name = 'listProcesses';
//         this.description = 'List processes';
//     }
//
//     async run({response, params}) {
//
//     }
// };
//
// module.exports.CreateProcessAction = class CreateProcessAction extends Action {
//     constructor() {
//         super();
//         this.name = 'createProcess';
//         this.description = 'Create process';
//     }
//
//     async run({response, params}) {
//
//     }
// };
//
// module.exports.GetProcessAction = class GetProcessAction extends Action {
//     constructor() {
//         super();
//         this.name = 'getProcess';
//         this.description = 'Get process';
//     }
//
//     async run({response, params}) {
//
//     }
// };
//
// module.exports.UpdateProcessAction = class UpdateProcessAction extends Action {
//     constructor() {
//         super();
//         this.name = 'updateProcess';
//         this.description = 'Update process';
//     }
//
//     async run({response, params}) {
//
//     }
// };
//
// module.exports.DeleteProcessAction = class DeleteProcessAction extends Action {
//     constructor() {
//         super();
//         this.name = 'deleteProcess';
//         this.description = 'Delete process';
//     }
//
//     async run({response, params}) {
//
//     }
// };
//
// module.exports.CloneProcessAction = class CloneProcessAction extends Action {
//     constructor() {
//         super();
//         this.name = 'CloneProcess';
//         this.description = 'Clone process';
//     }
//
//     async run({response, params}) {
//
//     }
// };
//
// module.exports.GetProcessFilesAction = class GetProcessFilesAction extends Action {
//     constructor() {
//         super();
//         this.name = 'getProcessFiles';
//         this.description = 'Get files for process';
//     }
//
//     async run({response, params}) {
//
//     }
// };