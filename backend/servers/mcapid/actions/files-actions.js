const {Action, api} = require('actionhero');
const dal = require('../lib/dal');

module.exports.UploadFileToProjectDirectoryAction = class UploadFileToProjectDirectoryAction extends Action {
    constructor() {
        super();
        this.name = 'uploadFileToProjectDirectory';
        this.description = 'Uploads a file into the given project directory';
        this.inputs = {
            project_id: {
                required: true,
            },

            directory_id: {
                required: true
            },

            file: {
                required: true,
            },

            return_directory: {
                default: false,
                validator: (param) => {
                    if (typeof param !== 'boolean') {
                        throw new Error(`Invalid value ${param} for parameter 'return_directory', must be true or false`);
                    }
                },
            }
        };
    }

    async run({response, params, user}) {
        let directoryInProject = await api.check.directoryInProject(params.directory_id, params.project_id);
        if (!directoryInProject) {
            throw new Error(`Directory ${params.directory_id} not found in project ${params.project_id}`);
        }

        let file = await dal.tryCatch(async() => await api.files.uploadFileToProjectDirectory(params.file, params.project_id, params.directory_id, user.id));
        if (!file) {
            throw new Error(`Unable to upload file ${params.file.name} for project ${params.project_id} into directory ${params.directory_id}`);
        }

        if (params.return_directory) {
            let dir = await api.directories.getDirectoryForProject(params.directory_id, params.project_id);
            if (!dir) {
                throw new Error(`Unable to retrieve directory for uploaded file`);
            }
            response.data = dir;
        } else {
            response.data = file;
        }
    }
};