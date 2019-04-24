const {Action, api} = require('actionhero');
const dal = require('@dal');
const convertible = require('@lib/convertible');
const path = require('path');
const etl = require('@lib/etl');
const mcdir = require('@lib/mcdir');

module.exports.CreateExperimentFromSpreadsheetV2Action = class CreateExperimentFromSpreadsheetV2Action extends Action {
    constructor() {
        super();
        this.name = 'createExperimentFromSpreadsheet';
        this.description = 'Create an experiment from a spreadsheet running mcetl';
        this.version = 2;
        this.inputs = {
            project_id: {
                required: true,
            },

            file_id: {
                required: true,
            },

            has_parent: {
                default: false,
            },

            experiment_name: {
                required: true,
                validator: name => {
                    if (name === '') {
                        throw new Error(`experiment_name cannot be blank`);
                    }

                    if (name.match(/[^0-9a-zA-Z_\-\s]/)) {
                        // A match means it found characters that are not in the list above
                        throw new Error(`Invalid experiment name, only a-zA-Z0-9_- are allowed`);
                    }
                }
            }
        };
    }

    async run({response, params, user}) {
        if (!await api.mc.check.fileInProject(params.file_id, params.project_id)) {
            throw new Error(`File ${params.file_id} not in project ${params.project_id}`);
        }

        if (!await api.mc.check.experimentNameIsUniqueInProject(params.experiment_name, params.project_id)) {
            throw new Error(`Experiment name ${params.experiment_name} is not unique in project ${params.project_id}`);
        }

        let file = await dal.tryCatch(async() => await api.mc.files.getFile(params.file_id));
        if (!file) {
            throw new Error(`Internal error: unable to retrieve file ${params.file_id}`);
        }

        if (!convertible.isSpreadsheet(file.mediatype.mime)) {
            throw new Error(`File ${file.name} is not a spreadsheet: ${file.mediatype.mime}`);
        }

        let etlJob = {
            projectId: params.project_id,
            experimentName: params.experiment_name,
            file: file,
            apikey: user.apikey,
            hasParent: params.has_parent,
        };

        await api.tasks.enqueue('mcetl', etlJob, 'etl');

        response.data = {success: `Successfully enqueued ETL V2 job for ${file.name}`};
    }
};

module.exports.CreateExperimentFromSpreadsheetV1Action = class CreateExperimentFromSpreadsheetV1Action extends Action {
    constructor() {
        super();
        this.name = 'createExperimentFromSpreadsheet';
        this.description = 'Create an experiment from a spreadsheet running pymcetl';
        this.version = 1;
        this.inputs = {
            project_id: {
                required: true,
            },

            experiment_name: {
                required: true,
            },

            file_id: {
                required: true,
            }
        };
    }

    async run({response, params, user}) {
        if (!await api.mc.check.fileInProject(params.file_id, params.project_id)) {
            throw new Error(`File ${params.file_id} not in project ${params.project_id}`);
        }

        let file = await dal.tryCatch(async() => await api.mc.files.getFile(params.file_id));
        if (!file) {
            throw new Error(`Internal error: unable to retrieve file ${params.file_id}`);
        }

        if (!convertible.isSpreadsheet(file.mediatype.mime)) {
            throw new Error(`File ${file.name} is not a spreadsheet: ${file.mediatype.mime}`);
        }

        // Remove project name from directory path
        let filePath = path.join(file.directory.name, file.name);
        let slash = filePath.indexOf('/');
        filePath = filePath.substring(slash, filePath.length);

        let etlJob = {
            projectId: params.project_id,
            experimentName: params.experiment_name,
            path: filePath,
            apikey: user.apikey,
        };

        await api.tasks.enqueue('processSpreadsheet', etlJob, 'etl');

        response.data = {success: `Successfully enqueued ETL V1 job for ${filePath}`};
    }
};

module.exports.CheckSpreadsheetAction = class CheckSpreadsheetAction extends Action {
    constructor() {
        super();
        this.name = 'checkSpreadsheet';
        this.description = 'Validate a spreadsheet for ETL';
        this.inputs = {
            project_id: {
                required: true,
            },

            file_id: {
                required: true,
            },

            experiment_name: {
                required: true,
            },

            has_parent: {
                default: false,
            }
        };
    }

    async run({response, params}) {
        if (!await api.mc.check.fileInProject(params.file_id, params.project_id)) {
            throw new Error(`File ${params.file_id} not in project ${params.project_id}`);
        }

        if (!await api.mc.check.experimentNameIsUniqueInProject(params.experiment_name, params.project_id)) {
            throw new Error(`Experiment name ${params.experiment_name} is not unique in project ${params.project_id}`);
        }

        let file = await dal.tryCatch(async() => await api.mc.files.getFile(params.file_id));
        if (!file) {
            throw new Error(`Internal error: unable to retrieve file ${params.file_id}`);
        }

        let filePath = mcdir.pathToFileId(mcdir.idToUse(file));

        let status = await etl.checkSpreadsheet(filePath);

        response.data = status;
    }
};

module.exports.CreateExperimentInProjectAction = class CreateExperimentInProjectAction extends Action {
    constructor() {
        super();
        this.name = 'createExperimentInProject';
        this.description = 'Creates a new experiment in the given project';
        this.inputs = {
            project_id: {
                required: true,
            },

            name: {
                required: true,
            },

            description: {
                default: ''
            }
        };
    }

    async run({response, params, user}) {
        if (!await api.mc.check.experimentNameIsUniqueInProject(params.name, params.project_id)) {
            throw new Error(`Experiment name ${params.name} is not unique in project ${params.project_id}`);
        }

        let e = await dal.tryCatch(async() => await api.mc.experiments.createExperiment(params.name, params.description, user.id, params.project_id));
        if (!e) {
            throw new Error(`Unable to create experiment ${params.name} in project ${params.project_id}`);
        }

        response.data = e;
    }
};

module.exports.GetExperimentAction = class GetExperimentAction extends Action {
    constructor() {
        super();
        this.name = 'getExperiment';
        this.description = 'Returns the given experiment in the given project';
        this.inputs = {
            project_id: {
                required: true,
            },

            experiment_id: {
                required: true,
            }
        };
    }

    async run({response, params}) {
        let e = await dal.tryCatch(async() => await api.mc.experiments.getExperiment(params.experiment_id));
        if (!e) {
            throw new Error(`Unable to retrieve experiment ${params.experiment_id} in project ${params.project_id}`);
        }

        response.data = e;
    }
};

module.exports.RenameExperimentInProjectAction = class RenameExperimentInProjectAction extends Action {
    constructor() {
        super();
        this.name = 'renameExperimentInProject';
        this.description = 'Renames the experiment';
        this.inputs = {
            project_id: {
                required: true
            },

            experiment_id: {
                required: true,
            },

            name: {
                required: true,
                validator: name => {
                    if (name.match(/[^0-9a-zA-Z_\-\s]/)) {
                        // A match means it found characters that are not in the list above
                        throw new Error(`Invalid experiment name, only a-zA-Z0-9_- are allowed`);
                    }
                }
            }
        };
    }

    async run({response, params}) {
        if (!await api.mc.check.experimentNameIsUniqueInProject(params.name, params.project_id)) {
            throw new Error(`Name ${params.name} is not unique in project ${params.project_id}`);
        }

        let renamed = await dal.tryCatch(async() => await api.mc.experiments.renameExperiment(params.experimentId, params.name));
        if (!renamed) {
            throw new Error(`Unable to rename experiment ${params.experiment_id} to ${params.name}`);
        }

        let e = await dal.tryCatch(async() => await api.mc.experiment.getExperiment(params.experimentId));
        if (!e) {
            throw new Error(`Unable to retrieve updated experiment ${params.experiment_id}`);
        }

        response.data = e;
    }
};

module.exports.DeleteExperimentInProjectAction = class DeleteExperimentInProjectAction extends Action {
    constructor() {
        super();
        this.name = 'deleteExperimentInProject';
        this.description = 'Delete an experiment in a project';
        this.inputs = {
            project_id: {
                required: true,
            },

            experiment_id: {
                required: true,
            }
        };
    }

    async run({response, params, user}) {
        if (!await api.mc.check.experimentInProject(params.experiment_id, params.project_id)) {
            throw new Error(`Experiment ${params.experiment_id} is not in project ${params.project_id}`);
        }

        let p = await api.mc.projects.getProjectSimple(params.project_id);
        let e = await api.mc.experiments.getExperimentSimple(params.experiment_id);

        if (p.owner !== user.id) {
            if (e.owner !== user.owner) {
                throw new Error(`You do not have permission to delete experiment ${params.experiment_id}`);
            }
        }

        let status = await dal.tryCatch(async() => await api.mc.experiments.removeExperimentFromJoinTables(params.experiment_id, params.project_id));

        if (!status) {
            throw new Error(`Unable to delete experiment ${params.experiment_id} in project ${params.project_id}`);
        }

        response.data = {success: true};
    }
};