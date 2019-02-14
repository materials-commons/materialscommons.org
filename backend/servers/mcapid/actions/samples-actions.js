const {Action} = require('actionhero');
const dal = require('../lib/dal');
const samples = require('../lib/dal/samples');

module.exports.GetSamplesForProjectAction = class GetSamplesForProjectAction extends Action {
    constructor() {
        super();
        this.name = 'getSamplesForProject';
        this.description = 'Returns all samples in the given project';
        this.inputs = {
            project_id: {
                required: true,
            }
        };
        this.outputExample = sampleExample;
    }

    async run({response, params}) {
        let results = await dal.tryCatch(async() => await samples.getSamplesForProject(params.project_id));
        if (results === null) {
            throw new Error(`Unable to retrieve samples for project ${params.project_id}`);
        }
        response.data = results;
    }
};

module.exports.GetSampleAction = class GetSampleAction extends Action {
    constructor() {
        super();
        this.name = 'getSample';
        this.description = 'Returns the given sample';
        this.inputs = {
            sample_id: {
                required: true,
            }
        };
        this.outputExample = {};
    }

    async run({response, params, user}) {
        const results = await dal.tryCatch(async() => await samples.getSample(user.id, params.sample_id));
        if (!results) {
            throw new Error(`Unable to retrieve samples ${params.sample_id}`);
        }
        response.data = results;
    }
};

const sampleExample = {};

//
// module.exports.ListSamplesAction = class ListSamplesAction extends Action {
//     constructor() {
//         super();
//         this.name = 'listSamples';
//         this.description = 'List samples for user';
//     }
//
//     async run({response, params}) {
//
//     }
// };
//
// module.exports.CreateSampleAction = class CreateSampleAction extends Action {
//     constructor() {
//         super();
//         this.name = 'createSample';
//         this.description = 'Creates a new sample';
//     }
//
//     async run({response, params}) {
//
//     }
// };
//
// module.exports.GetSampleAction = class GetSampleAction extends Action {
//     constructor() {
//         super();
//         this.name = 'getSample';
//         this.description = 'Gets sample details';
//     }
//
//     async run({response, params}) {
//
//     }
// };
//
// module.exports.UpdateSampleAction = class UpdateSampleAction extends Action {
//     constructor() {
//         super();
//         this.name = 'updateSample';
//         this.description = 'Updates sample';
//     }
//
//     async run({response, params}) {
//
//     }
// };
//
// module.exports.DeleteSampleAction = class DeleteSampleAction extends Action {
//     constructor() {
//         super();
//         this.name = 'deleteSample';
//         this.description = 'Delete sample';
//     }
//
//     async run({response, params}) {
//
//     }
// };
//
// module.exports.CloneSampleAction = class CloneSampleAction extends Action {
//     constructor() {
//         super();
//         this.name = 'cloneSample';
//         this.description = 'Clone sample';
//     }
//
//     async run({response, params}) {
//
//     }
// };
//
// module.exports.GetSampleFilesAction = class GetSampleFilesAction extends Action {
//     constructor() {
//         super();
//         this.name = 'getSampleFiles';
//         this.description = 'Get files for sample';
//     }
//
//     async run({response, params}) {
//
//     }
// };