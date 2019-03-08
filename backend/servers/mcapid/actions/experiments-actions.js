const {Action, api} = require('actionhero');
const dal = require('@dal');
const convertible = require('@lib/convertible');
const path = require('path');

module.exports.CreateExperimentFromSpreadsheetAction = class CreateExperimentFromSpreadsheetAction extends Action {
    constructor() {
        super();
        this.name = 'createExperimentFromSpreadsheet';
        this.description = 'createExperimentFromSpreadsheet';
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

        response.data = {success: `Successfully enqueued ETL job for ${filePath}`};
    }
};