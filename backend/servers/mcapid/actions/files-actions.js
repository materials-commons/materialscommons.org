const {Action, api} = require('actionhero');
const dal = require('@dal');

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
        let directoryInProject = await api.mc.check.directoryInProject(params.directory_id, params.project_id);
        if (!directoryInProject) {
            throw new Error(`Directory ${params.directory_id} not found in project ${params.project_id}`);
        }

        let file = await dal.tryCatch(async() => await api.mc.files.uploadFileToProjectDirectory(params.file, params.project_id, params.directory_id, user.id));
        if (!file) {
            throw new Error(`Unable to upload file ${params.file.name} for project ${params.project_id} into directory ${params.directory_id}`);
        }

        if (params.return_directory) {
            let dir = await api.mc.directories.getDirectoryForProject(params.directory_id, params.project_id);
            if (!dir) {
                throw new Error(`Unable to retrieve directory for uploaded file`);
            }
            response.data = dir;
        } else {
            response.data = file;
        }
    }
};

module.exports.MoveFileAction = class MoveFileAction extends Action {
    constructor() {
        super();
        this.name = 'moveFile';
        this.description = 'Moves a file into a different directory';
        this.inputs = {
            project_id: {
                required: true,
            },
            to_directory_id: {
                required: true,
            },
            from_directory_id: {
                required: true,
            },
            file_id: {
                requied: true,
            }
        };
        this.outputExample = {};
    }

    async run({response, params}) {
        if (!await api.mc.check.allDirectoriesInProject([params.to_directory_id, params.from_directory_id], params.project_id)) {
            throw new Error(`One or more directories ${params.to_directory_id}, ${params.from_directory_id} not found in project ${params.project_id}`);
        }

        if (!await api.mc.check.fileInProject(params.file_id, params.project_id)) {
            throw new Error(`File ${params.file_id} not found in project ${params.project_id}`);
        }

        if (!await api.mc.check.fileInDirectory(params.file_id, params.from_directory_id)) {
            throw new Error(`File ${params.file_id} not found in directory ${params.from_directory_id}`);
        }

        let file = await dal.tryCatch(async() => await api.mc.files.moveFileToDirectory(params.file_id, params.from_directory_id, params.to_directory_id));
        if (!file) {
            throw new Error(`Unable to move file ${params.file_id} from directory ${params.from_directory_id} to directory ${params.to_directory_id} in project ${params.project_id}`);
        }

        response.data = file;
    }
};

module.exports.GetFileInProjectAction = class GetFileInProjectAction extends Action {
    constructor() {
        super();
        this.name = 'getFileInProject';
        this.description = 'Return the file in the project';
        this.inputs = {
            project_id: {
                required: true,
            },

            file_id: {
                required: true,
            }
        };
        this.outputExample = {};
    }

    async run({response, params}) {
        if (!await api.mc.check.fileInProject(params.file_id, params.project_id)) {
            throw new Error(`File ${params.file_id} not found in project ${params.project_id}`);
        }

        let file = await dal.tryCatch(async() => await api.mc.files.getFile(params.file_id));
        if (!file) {
            throw new Error(`Unable to retrieve file ${params.file_id} in project ${params.project_id}`);
        }

        response.data = file;
    }
};