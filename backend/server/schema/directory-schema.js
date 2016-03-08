module.exports = function(schema) {
    const promise = require('bluebird');

    return {
        defineCreateDirectorySchema: defineCreateDirectorySchema,
        defineMoveDirectorySchema: defineMoveDirectorySchema,
        defineRenameDirectorySchema: defineRenameDirectorySchema
    };

    function defineCreateDirectorySchema() {
        let createDirSchema = schema.defineSchema('CreateDirectory', {
            project_id: {
                type: 'string',
                nullable: false
            },

            from_dir: {
                type: 'string',
                nullable: false,
                mustExistInProject: 'directories'
            },

            path: {
                type: 'string',
                nullable: false
            }
        });
        createDirSchema.validateAsync = promise.promisify(createDirSchema.validate);
        return createDirSchema;
    }

    function defineMoveDirectorySchema() {
        let moveDirSchema = schema.defineSchema('MoveDirectory', {
            project_id: {
                type: 'string',
                nullable: false
            },

            directory_id: {
                type: 'string',
                nullable: false,
                mustExistInProject: 'directories'
            },

            new_directory_id: {
                type: 'string',
                nullable: false,
                mustExistInProject: 'directories'
            }
        });
        moveDirSchema.validateAsync = promise.promisify(createDirSchema.validate);
        return moveDirSchema;
    }

    function defineRenameDirectorySchema() {
        let renameDirSchema = schema.defineSchema('RenameDirectory', {
            project_id: {
                type: 'string',
                nullable: false
            },

            directory_id: {
                type: 'string',
                nullable: false,
                mustExistInProject: 'directories'
            },

            new_name: {
                type: 'string',
                nullable: false,
                minLength: 1,
                mustNotExistInParentDirectory: 'directory_id'
            }
        });
        renameDirSchema.validateAsync = promise.promisify(createDirSchema.validate);
        return renameDirSchema;
    }
};
