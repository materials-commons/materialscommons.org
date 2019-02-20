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
// module.exports.CreateDirectoryAction = class CreateDirectoryAction extends Action {
//     constructor() {
//         super();
//         this.name = 'createDirectory';
//         this.description = 'Creates a directory';
//     }
//
//     async run({response, params}) {
//
//     }
// };
//

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