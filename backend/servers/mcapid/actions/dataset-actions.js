const {Action} = require('actionhero');
const dal = require('../lib/dal');
const datasets = require('../lib/dal/datasets');
const _ = require('lodash');

module.exports.ListDatasetsAction = class ListDatasetsAction extends Action {
    constructor() {
        super();
        this.name = 'listDatasets';
        this.description = 'Retrieve a list of all datasets for a project';
        this.inputs = {
            project_id: {
                required: true,
            }
        }
    }

    async run({response, params}) {
        const datasets = await dal.tryCatch(async () => await datasets.getDatasetsForProject(params.project_id));
        if (!datasets) {
            throw new Error(`Unable to get datasets for project ${params.project_id}`);
        }

        response.data = datasets;
    }
};

module.exports.GetDatasetAction = class GetDatasetAction extends Action {
    constructor() {
        super();
        this.name = "getDataset";
        this.description = "Get dataset";
        this.inputs = {
            project_id: {
                required: true,
            },

            dataset_id: {
                required: true,
            },
        }
    }

    async run({response, params}) {
        const inProject = await dal.tryCatch(async () => await datasets.datasetInProject(params.dataset_id, params.project_id));
        if (!inProject) {
            throw new Error(`Dataset ${params.dataset_id} not in project ${params.project_id}`);
        }

        const ds = await dal.tryCatch(async () => await datasets.getDataset(params.dataset_id));
        if (!ds) {
            throw new Error(`Unable to retrieve dataset ${params.dataset_id}`);
        }

        response.data = ds;
    }
};

module.exports.CreateDatasetAction = class CreateDatasetAction extends Action {
    constructor() {
        super();
        this.name = 'createDataset';
        this.description = 'Create a new dataset';
        this.inputs = {
            title: {
                required: true,
                validator: (param) => {
                    if (!_.isString(param)) {
                        throw new Error('title must be a string');
                    }

                    if (_.size(param) < 1) {
                        throw new Error('title must be at least length 1');
                    }
                }
            },

            project_id: {
                required: true,
            },

            description: {
                default: "",
                validator: (param) => {
                    if (!_.isString(param)) {
                        throw new Error('description must be a string');
                    }
                }
            }
        }
    }

    async run({response, params, user}) {
        const dsParams = {
            title: params.title,
            description: params.description
        };

        const ds = await dal.tryCatch(async () => await datasets.createDataset(dsParams, user.id, params.project_id));
        if (!ds) {
            throw new Error(`Unable to create dataset ${dsParams.title}`);
        }

        response.data = ds;
    }
};

module.exports.DeleteDatasetAction = class DeleteDatasetAction extends Action {
    constructor() {
        super();
        this.name = 'deleteDataset';
        this.description = 'Deletes a dataset';
    }

    async run({response, params}) {
        const success = await dal.tryCatch(async () => await datasets.deleteDataset(params.dataset_id));
        if (!success) {
            throw new Error(`unable to delete dataset ${params.dataset_id}`);
        }
    }
};

module.exports.UpdateDatasetAction = class UpdateDatasetAction extends Action {
    constructor() {
        super();
        this.name = 'updateDataset';
        this.description = 'Updates attributes of a dataset';
    }

    async run({response, params}) {

    }
};

module.exports.AddDatasetFilesAction = class AddDatasetFilesAction extends Action {
    constructor() {
        super();
        this.name = 'addDatasetFiles';
        this.description = 'Adds files to a dataset';
    }

    async run({response, params}) {

    }
};

module.exports.DeleteDatasetFilesAction = class DeleteDatasetFilesAction extends Action {
    constructor() {
        super();
        this.name = 'deleteDatasetFiles';
        this.description = 'Delete files from a dataset';
    }

    async run({response, params}) {

    }
};

module.exports.AddDatasetSamplesAction = class AddDatasetSamplesAction extends Action {
    constructor() {
        super();
        this.name = 'addDatasetSamples';
        this.description = 'Add samples to a dataset';
    }

    async run({response, params}) {

    }
};

module.exports.DeleteDatasetSamplesAction = class DeleteDatasetSamplesAction extends Action {
    constructor() {
        super();
        this.name = 'deleteDatasetSamples';
        this.description = 'Delete samples from a dataset';
    }

    async run({response, params}) {

    }
};

module.exports.DeleteProcessesFromDatasetSampleAction = class DeleteProcessesFromDatasetSampleAction extends Action {
    constructor() {
        super();
        this.name = 'deleteProcessesFromDatasetSampleAction';
        this.description = 'Delete processes from a sample in dataset';
    }

    async run({response, params}) {

    }
};

module.exports.PublishDatasetAction = class PublishDatasetAction extends Action {
    constructor() {
        super();
        this.name = 'publishDataset';
        this.description = 'Publish a dataset';
    }

    async run({response, params}) {

    }
};

module.export.UnpublishDatasetAction = class UnpublishDatasetAction extends Action {
    constructor() {
        super();
        this.name = 'unpublishDataset';
        this.description = 'Unpublish an already published dataset';
    }

    async run({response, params}) {

    }
};