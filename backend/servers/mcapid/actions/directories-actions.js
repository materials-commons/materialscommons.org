const {Action} = require('actionhero');
const directories = require('../lib/dal/directories');
const dal = require('../lib/dal');

//
// module.exports.ListDirectoriesAction = class ListDirectoriesAction extends Action {
//     constructor() {
//         super();
//         this.name = 'listDirectories';
//         this.description = 'List top level directories for user';
//     }
//
//     async run({response, params}) {
//
//     }
// };
//

/*
parent_directory_id: parentId,
                path: path,
                return_parent: true,
 */

module.exports.CreateDirectoryInProjectAction = class CreateDirectoryInProjectAction extends Action {
    constructor() {
        super();
        this.name = 'createDirectoryInProject';
        this.description = 'Creates a directory in the project';
        this.inputs = {
            project_id: {
                required: true,
            },

            parent_directory_id: {
                required: true,
            },

            path: {
                required: true,
            },

            return_parent: {
                default: false,
                validator: (param) => {
                    if (typeof param !== 'boolean') {
                        throw new Error(`Invalid value ${param} for parameter 'return_parent', must be true or false`);
                    }
                },
            }
        };
    }

    async run({response, params}) {
        let dir = await dal.tryCatch(async() => await directories.createDirectoryInProject(params.path, params.project_id,
            params.parent_directory_id, params.return_parent));

        if (!dir) {
            throw new Error(`Unable to create directory ${params.path} in project ${params.project_id} with parent directory ${params.parent_directory_id}`);
        }

        response.data = dir;
    }
};

module.exports.GetDirectoryForProjectAction = class GetDirectoryForProjectAction extends Action {
    constructor() {
        super();
        this.name = 'getDirectoryForProject';
        this.description = 'Get directory in project and its immediate children directories and files';
        this.inputs = {
            project_id: {
                required: true,
            },

            directory_id: {
                required: true
            }
        };
    }

    async run({response, params}) {
        const dir = await dal.tryCatch(async() => await directories.getDirectoryForProject(params.directory_id, params.project_id));
        if (dir === null) {
            throw new Error(`Unable retrieve directory ${params.directory_id} in project ${params.project_id}`);
        }

        response.data = dir;
    }
};

module.exports.GetDirectoryByPathForProjectAction = class GetDirectoryByPathForProjectAction extends Action {
    constructor() {
        super();
        this.name = 'getDirectoryByPathForProject';
        this.description = 'Get directory by path in project and its immediate children directories and files';
        this.inputs = {
            project_id: {
                required: true,
            },

            directory_path: {
                required: true
            }
        };
    }

    async run({response, params}) {
        const dir = await dal.tryCatch(async() => await directories.getDirectoryByPathForProject(params.directory_path, params.project_id));
        if (dir === null) {
            throw new Error(`Unable retrieve directory ${params.directory_path} in project ${params.project_id}`);
        }

        response.data = dir;
    }
};

//
// module.exports.UpdateDirectoryAction = class UpdateDirectoryAction extends Action {
//     constructor() {
//         super();
//         this.name = 'updateDirectory';
//         this.description = 'Updates directory metadata and allows files and sub directories to be added/deleted';
//     }
//
//     async run({response, params}) {
//
//     }
// };
//
// module.exports.DeleteDirectoryAction = class DeleteDirectoryAction extends Action {
//     constructor() {
//         super();
//         this.name = 'deleteDirectory';
//         this.description = 'Deletes a directory - only leaf directory nodes may be deleted';
//     }
//
//     async run({response, params}) {
//
//     }
// };