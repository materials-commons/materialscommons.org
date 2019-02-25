const {Action, api} = require('actionhero');
const dal = require('../lib/dal');
const _ = require('lodash');

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
        let {path, project_id, parent_directory_id, return_parent} = params;
        let dir = await dal.tryCatch(async() => await api.directories.createDirectoryInProject(path, project_id, parent_directory_id, return_parent));

        if (!dir) {
            throw new Error(`Unable to create directory ${path} in project ${project_id} with parent directory ${parent_directory_id}`);
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
        const dir = await dal.tryCatch(async() => await api.directories.getDirectoryForProject(params.directory_id, params.project_id));
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
        const dir = await dal.tryCatch(async() => await api.directories.getDirectoryByPathForProject(params.directory_path, params.project_id));
        if (dir === null) {
            throw new Error(`Unable retrieve directory ${params.directory_path} in project ${params.project_id}`);
        }

        response.data = dir;
    }
};

module.exports.DeleteFilesFromDirectoryInProjectAction = class DeleteFilesFromDirectoryInProjectAction extends Action {
    constructor() {
        super();
        this.name = 'deleteFilesFromDirectoryInProject';
        this.description = 'Delete files and directories from target directory in project';
        this.inputs = {
            directory_id: {
                required: true,
            },

            project_id: {
                required: true,
            },

            return_parent: {
                default: false,
                validator: (param) => {
                    if (typeof param !== 'boolean') {
                        throw new Error(`Invalid value ${param} for parameter 'return_parent', must be true or false`);
                    }
                },
            },

            files: {
                required: true,
                validator: (files) => {
                    let errorMsg = `files param must be an array of objects with format {id: 'an-id', otype: 'directory || file'}`;
                    if (!_.isArray(files)) {
                        throw new Error(errorMsg);
                    }
                    files.forEach(f => {
                        if (!_.isObject(f)) {
                            throw new Error(errorMsg);
                        }

                        if (!_.conformsTo(f, {id: (val) => _.isString(val), otype: (val) => (val === 'file' || val === 'directory')})) {
                            throw new Error(errorMsg);
                        }

                        let keys = _.keys(f);
                        if (keys.length !== 2) {
                            throw new Error(errorMsg);
                        }

                        if (!_.contains(keys, 'id')) {
                            throw new Error(errorMsg);
                        }

                        if (!_.contains(keys, 'otype')) {
                            throw new Error(errorMsg);
                        }
                    });

                    return true;
                }
            }
        };
    }

    async run({response, params}) {
        let results = await dal.tryCatch(async() => await api.directories.deleteFilesFromDirectoryInProject(params.files, params.directory_id, params.project_id));
        if (results === null) {
            throw new Error(`Unable to delete files in directory ${params.directory_id} for project ${params.project_id}`);
        }

        response.data = results;
    }
};