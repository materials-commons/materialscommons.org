const {Action, api} = require('actionhero');
const dal = require('@dal');
const _ = require('lodash');
const validators = require('@lib/validators');

module.exports.ListDatasetsAction = class ListDatasetsAction extends Action {
    constructor() {
        super();
        this.name = 'listDatasets';
        this.description = 'Retrieve a list of all datasets for a project';
        this.inputs = {
            project_id: {
                required: true,
            }
        };
    }

    async run({response, params}) {
        const dsets = await dal.tryCatch(async() => await api.mc.datasets.getDatasetsForProject(params.project_id));
        if (!dsets) {
            throw new Error(`Unable to get datasets for project ${params.project_id}`);
        }

        response.data = dsets;
    }
};

module.exports.GetDatasetAction = class GetDatasetAction extends Action {
    constructor() {
        super();
        this.name = 'getDataset';
        this.description = 'Get dataset';
        this.inputs = {
            project_id: {
                required: true,
            },

            dataset_id: {
                required: true,
            },
        };
    }

    async run({response, params}) {
        const inProject = await dal.tryCatch(async() => await api.mc.check.datasetInProject(params.dataset_id, params.project_id));
        if (!inProject) {
            throw new Error(`Dataset ${params.dataset_id} not in project ${params.project_id}`);
        }

        const ds = await dal.tryCatch(async() => await api.mc.datasets.getDataset(params.dataset_id));
        if (!ds) {
            throw new Error(`Unable to retrieve dataset ${params.dataset_id}`);
        }

        response.data = ds;
    }
};

module.exports.GetDatasetFilesAction = class GetDatasetFilesAction extends Action {
    constructor() {
        super();
        this.name = 'getDatasetFiles';
        this.description = 'Get dataset files';
        this.inputs = {
            project_id: {
                required: true,
            },

            dataset_id: {
                required: true,
            },
        };
    }

    async run({response, params}) {
        const inProject = await dal.tryCatch(async() => await api.mc.check.datasetInProject(params.dataset_id, params.project_id));
        if (!inProject) {
            throw new Error(`Dataset ${params.dataset_id} not in project ${params.project_id}`);
        }

        const ds = await dal.tryCatch(async() => await api.mc.datasets.getDatasetFiles(params.dataset_id));
        if (!ds) {
            throw new Error(`Unable to retrieve dataset ${params.dataset_id}`);
        }

        response.data = ds;
    }
};

module.exports.GetDatasetSamplesAndProcessesAction = class GetDatasetSamplesAndProcessesAction extends Action {
    constructor() {
        super();
        this.name = 'getDatasetSamplesAndProcesses';
        this.description = 'Get dataset samples and processes';
        this.inputs = {
            project_id: {
                required: true,
            },

            dataset_id: {
                required: true,
            },
        };
    }

    async run({response, params}) {
        const inProject = await dal.tryCatch(async() => await api.mc.check.datasetInProject(params.dataset_id, params.project_id));
        if (!inProject) {
            throw new Error(`Dataset ${params.dataset_id} not in project ${params.project_id}`);
        }

        const ds = await dal.tryCatch(async() => await api.mc.datasets.getDatasetSamplesAndProcesses(params.dataset_id));
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
                    if (!validators.validString(param, 1)) {
                        throw new Error(`title is invalid ${param}`);
                    }
                }
            },

            project_id: {
                required: true,
            },

            description: {
                default: '',
                validator: (param) => {
                    if (!_.isString(param)) {
                        throw new Error('description must be a string');
                    }
                }
            },

            samples: {
                default: [],
                validator: (param) => {
                    if (!_.isArray(param)) {
                        throw new Error('samples must be an array');
                    }
                }
            },

            file_selection: {
                default: {
                    include_dirs: [],
                    exclude_dirs: [],
                    include_files: [],
                    exclude_files: [],
                }
            }
        };
    }

    async run({response, params, user}) {
        const dsParams = {
            title: params.title,
            description: params.description,
            samples: params.samples,
        };

        if (params.samples.length) {
            const allInProject = await dal.tryCatch(async() => await api.mc.check.allSamplesInProject(params.samples, params.project_id));
            if (!allInProject) {
                throw new Error(`Invalid samples ${params.samples} for project ${params.project_id}`);
            }
        }

        const ds = await dal.tryCatch(async() => await api.mc.datasets.createDataset(dsParams, user.id, params.project_id, params.file_selection));
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
        this.inputs = {
            dataset_id: {
                required: true,
            },

            project_id: {
                required: true,
            }
        };
    }

    async run({response, params}) {
        const inProject = await dal.tryCatch(async() => await api.mc.check.datasetInProject(params.dataset_id, params.project_id));
        if (!inProject) {
            throw new Error(`Dataset ${params.dataset_id} not in project ${params.project_id}`);
        }

        const success = await dal.tryCatch(async() => await api.mc.datasets.deleteDataset(params.dataset_id));
        if (!success) {
            throw new Error(`unable to delete dataset ${params.dataset_id}`);
        }

        response.data = {success: true};
    }
};

module.exports.UpdateDatasetFileSelectionAction = class UpdateDatasetFileSelectionAction extends Action {
    constructor() {
        super();
        this.name = 'updateDatasetFileSelection';
        this.description = 'Update the file selection for a dataset';
        this.inputs = {
            project_id: {
                required: true,
            },

            dataset_id: {
                required: true,
            },

            file_selection: {
                required: true,
            }
        };
    }

    async run({response, params}) {
        const inProject = await dal.tryCatch(async() => await api.mc.check.datasetInProject(params.dataset_id, params.project_id));
        if (!inProject) {
            throw new Error(`Dataset ${params.dataset_id} not in project ${params.project_id}`);
        }

        const ds = await dal.tryCatch(async() => await api.mc.datasets.getDataset(params.dataset_id));
        if (!ds) {
            throw new Error(`Unable to retrieve dataset ${params.dataset_id}`);
        }

        const selectionId = await dal.tryCatch(async() => await api.mc.datasets.updateDatasetFileSelection(ds.id, ds.selection_id, params.file_selection));
        if (!selectionId) {
            throw new Error(`Unable to update file selection for dataset`);
        }

        // Dataset now contains this selection and selection id, so update ds, since we retrieved the dataset before the database entry was
        // updated with the selection information.
        ds.selection_id = selectionId;
        ds.file_selection = params.file_selection;

        response.data = ds;
    }
};

module.exports.AddDatasetFilesAction = class AddDatasetFilesAction extends Action {
    constructor() {
        super();
        this.name = 'addDatasetFiles';
        this.description = 'Adds files to a dataset';
        this.inputs = {
            files: {
                required: true,
                validator: (param) => {
                    if (!_.isArray(param)) {
                        throw new Error(`files must be an array of file ids ${param}`);
                    }
                }
            },

            dataset_id: {
                required: true,
            },

            project_id: {
                required: true,
            }
        };
    }

    async run({response, params}) {
        const inProject = await dal.tryCatch(async() => await api.mc.check.datasetInProject(params.dataset_id, params.project_id));
        if (!inProject) {
            throw new Error(`Dataset ${params.dataset_id} not in project ${params.project_id}`);
        }

        const allInProject = await dal.tryCatch(async() => await api.mc.check.allFilesInProject(params.files, params.project_id));
        if (!allInProject) {
            throw new Error(`Invalid files ${params.files} for project ${params.project_id}`);
        }

        const result = await dal.tryCatch(async() => await api.mc.datasets.addFilesToDataset(params.dataset_id, params.files));
        if (!result) {
            throw new Error(`Unable to add files ${params.files} to dataset ${params.dataset_id}`);
        }

        const ds = await dal.tryCatch(async() => await api.mc.datasets.getDataset(params.dataset_id));
        if (!ds) {
            throw new Error(`Unable to retrieve dataset ${params.dataset_id}`);
        }

        response.data = ds;
    }
};

module.exports.AddFilesAndDirsToDatasetAction = class AddFilesAndDirsToDatasetAction extends Action {
    constructor() {
        super();
        this.name = 'addFilesAndDirsToDataset';
        this.description = 'Adds files and directories to dataset';
        this.inputs = {
            dataset_id: {
                required: true,
            },

            project_id: {
                required: true,
            },

            files: {
                default: [],
            },

            directories: {
                default: [],
            }
        };
    }

    async run({response, params}) {
        const inProject = await dal.tryCatch(async() => await api.mc.check.datasetInProject(params.dataset_id, params.project_id));
        if (!inProject) {
            throw new Error(`Dataset ${params.dataset_id} not in project ${params.project_id}`);
        }

        const allFilesInProject = await dal.tryCatch(async() => await api.mc.check.allFilesInProject(params.files, params.project_id));
        if (!allFilesInProject) {
            throw new Error(`Invalid files ${params.files} for project ${params.project_id}`);
        }

        const dirIds = params.directories.map(d => d.id);
        const allDirsInProject = await dal.tryCatch(async() => await api.mc.check.allDirectoriesInProject(dirIds, params.project_id));
        if (!allDirsInProject) {
            throw new Error(`Invalid files ${params.files} for project ${params.project_id}`);
        }

        const result = await dal.tryCatch(async() => await api.mc.datasets.addFilesAndDirectoriesToDataset(params.dataset_id, params.files, params.directories));
        if (!result) {
            throw new Error(`Unable to add files and directories to dataset ${params.dataset_id}`);
        }

        const ds = await dal.tryCatch(async() => await api.mc.datasets.getDataset(params.dataset_id));
        if (!ds) {
            throw new Error(`Unable to retrieve dataset ${params.dataset_id}`);
        }

        response.data = ds;
    }
};

module.exports.DeleteDatasetFilesAction = class DeleteDatasetFilesAction extends Action {
    constructor() {
        super();
        this.name = 'deleteDatasetFiles';
        this.description = 'Delete files from a dataset';
        this.inputs = {
            files: {
                required: true,
                validator: (param) => {
                    if (!_.isArray(param)) {
                        throw new Error(`files must be an array of file ids ${param}`);
                    }
                }
            },

            dataset_id: {
                required: true,
            },

            project_id: {
                required: true,
            }
        };
    }

    async run({response, params}) {
        const inProject = await dal.tryCatch(async() => await api.mc.check.datasetInProject(params.dataset_id, params.project_id));
        if (!inProject) {
            throw new Error(`Dataset ${params.dataset_id} not in project ${params.project_id}`);
        }

        const ds = await dal.tryCatch(async() => await api.mc.datasets.deleteFilesFromDataset(params.dataset_id, params.files));
        if (!ds) {
            throw new Error(`Unable to delete files ${params.files} from dataset ${params.dataset_id}`);
        }

        response.data = ds;
    }
};

module.exports.AddDatasetSamplesAction = class AddDatasetSamplesAction extends Action {
    constructor() {
        super();
        this.name = 'addDatasetSamples';
        this.description = 'Add samples to a dataset';
        this.inputs = {
            samples: {
                required: true,
                validator: (param) => {
                    if (!_.isArray(param)) {
                        throw new Error(`samples must be an array of sample ids ${param}`);
                    }
                }
            },

            dataset_id: {
                required: true,
            },

            project_id: {
                required: true,
            }
        };
    }

    async run({response, params}) {
        const inProject = await dal.tryCatch(async() => await api.mc.check.datasetInProject(params.dataset_id, params.project_id));
        if (!inProject) {
            throw new Error(`Dataset ${params.dataset_id} not in project ${params.project_id}`);
        }

        const allInProject = await dal.tryCatch(async() => await api.mc.check.allSamplesInProject(params.samples, params.project_id));
        if (!allInProject) {
            throw new Error(`Invalid samples ${params.samples} for project ${params.project_id}`);
        }

        const ds = await dal.tryCatch(async() => await api.mc.datasets.addSamplesToDataset(params.dataset_id, params.samples));
        if (!ds) {
            throw new Error(`Unable to add samples ${params.samples} to dataset ${params.dataset_id}`);
        }

        response.data = ds;
    }
};

module.exports.DeleteDatasetSamplesAction = class DeleteDatasetSamplesAction extends Action {
    constructor() {
        super();
        this.name = 'deleteDatasetSamples';
        this.description = 'Delete samples from a dataset';
        this.inputs = {
            samples: {
                required: true,
                validator: (param) => {
                    if (!_.isArray(param)) {
                        throw new Error(`samples must be an array of file ids ${param}`);
                    }
                }
            },

            dataset_id: {
                required: true,
            },

            project_id: {
                required: true,
            }
        };
    }

    async run({response, params}) {
        const inProject = await dal.tryCatch(async() => await api.mc.check.datasetInProject(params.dataset_id, params.project_id));
        if (!inProject) {
            throw new Error(`Dataset ${params.dataset_id} not in project ${params.project_id}`);
        }

        const ds = await dal.tryCatch(async() => await api.mc.datasets.deleteSamplesFromDataset(params.dataset_id, params.samples));
        if (!ds) {
            throw new Error(`Unable to delete samples ${params.samples} from dataset ${params.dataset_id}`);
        }

        response.data = ds;
    }
};

module.exports.DeleteProcessesFromDatasetSampleAction = class DeleteProcessesFromDatasetSampleAction extends Action {
    constructor() {
        super();
        this.name = 'deleteProcessesFromDatasetSample';
        this.description = 'Delete processes from a sample in dataset';
        this.inputs = {
            processes: {
                required: true,
                validator: (param) => {
                    if (!_.isArray(param)) {
                        throw new Error(`processes must be an array of file ids ${param}`);
                    }
                }
            },

            dataset_id: {
                required: true,
            },

            project_id: {
                required: true,
            }
        };
    }

    async run({response, params}) {
        const inProject = await dal.tryCatch(async() => await api.mc.check.datasetInProject(params.dataset_id, params.project_id));
        if (!inProject) {
            throw new Error(`Dataset ${params.dataset_id} not in project ${params.project_id}`);
        }

        const ds = await dal.tryCatch(async() => await api.mc.datasets.deleteProcessesFromDataset(params.dataset_id, params.processes));
        if (!ds) {
            throw new Error(`Unable to delete processes ${params.processes} from dataset ${params.dataset_id}`);
        }

        response.data = ds;
    }
};

module.exports.PublishDatasetAction = class PublishDatasetAction extends Action {
    constructor() {
        super();
        this.name = 'publishDataset';
        this.description = 'Publish a dataset';
        this.inputs = {
            dataset_id: {
                required: true,
            },

            project_id: {
                required: true,
            }
        };
    }

    async run({response, params}) {
        const inProject = await dal.tryCatch(async() => await api.mc.check.datasetInProject(params.dataset_id, params.project_id));
        if (!inProject) {
            throw new Error(`Dataset ${params.dataset_id} not in project ${params.project_id}`);
        }

        const ds = await dal.tryCatch(async() => await api.mc.datasets.publish(params.dataset_id));
        if (!ds) {
            throw new Error(`Unable to publish dataset ${params.dataset_id}`);
        }

        let dsJobArgs = {
            projectId: params.project_id,
            datasetId: params.dataset_id,
            isPrivate: false,
        };

        await api.tasks.enqueue('publish-ds-to-globus', dsJobArgs, 'datasets');

        response.data = ds;
    }
};

module.exports.PublishPrivateDatasetAction = class PublishPrivateDatasetAction extends Action {
    constructor() {
        super();
        this.name = 'publishPrivateDataset';
        this.description = 'Publish a private dataset';
        this.inputs = {
            dataset_id: {
                required: true,
            },

            project_id: {
                required: true,
            }
        };
    }

    async run({response, params}) {
        const inProject = await dal.tryCatch(async() => await api.mc.check.datasetInProject(params.dataset_id, params.project_id));
        if (!inProject) {
            throw new Error(`Dataset ${params.dataset_id} not in project ${params.project_id}`);
        }

        let dsJobArgs = {
            projectId: params.project_id,
            datasetId: params.dataset_id,
            isPrivate: true,
        };

        await api.tasks.enqueue('publish-ds-to-globus', dsJobArgs, 'datasets');

        response.data = {
            globus_path: `/__datasets/${params.dataset_id}/`,
            endpoint_id: process.env.MC_CONFIDENTIAL_CLIENT_ENDPOINT,
        };
    }
};

module.exports.UnpublishDatasetAction = class UnpublishDatasetAction extends Action {
    constructor() {
        super();
        this.name = 'unpublishDataset';
        this.description = 'Unpublish an already published dataset';
        this.inputs = {
            dataset_id: {
                required: true,
            },

            project_id: {
                required: true,
            }
        };
    }

    async run({response, params}) {
        const inProject = await dal.tryCatch(async() => await api.mc.check.datasetInProject(params.dataset_id, params.project_id));
        if (!inProject) {
            throw new Error(`Dataset ${params.dataset_id} not in project ${params.project_id}`);
        }

        const originalDataset = await dal.tryCatch(async() => await api.mc.datasets.getDataset(params.dataset_id));
        if (!originalDataset) {
            throw new Error(`Unable to retrieve dataset`);
        }

        const ds = await dal.tryCatch(async() => await api.mc.datasets.unpublish(params.dataset_id));
        if (!ds) {
            throw new Error(`Unable to publish dataset ${params.dataset_id}`);
        }

        let dsJobArgs = {
            datasetId: params.dataset_id,
            isPrivate: !originalDataset.published,
        };

        await api.tasks.enqueue('remove-ds-in-globus', dsJobArgs, 'datasets');

        response.data = ds;
    }
};