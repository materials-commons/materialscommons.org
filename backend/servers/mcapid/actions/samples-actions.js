const {Action, api} = require('actionhero');
const dal = require('../lib/dal');

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
        let results = await dal.tryCatch(async() => await api.samples.getSamplesForProject(params.project_id));
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
        const results = await dal.tryCatch(async() => await api.samples.getSample(user.id, params.sample_id));
        if (!results) {
            throw new Error(`Unable to retrieve samples ${params.sample_id}`);
        }
        response.data = results;
    }
};

const sampleExample = {};