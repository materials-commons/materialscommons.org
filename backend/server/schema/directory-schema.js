module.exports = function(schema) {
    const promise = require('bluebird');

    console.log('setting up directory schema');
    return {
        defineCreateDirectorySchema: defineCreateDirectorySchema
    };

    function defineCreateDirectorySchema() {
        let dir = schema.defineSchema('CreateDirectory', {
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
        dir.validateAsync = promise.promisify(dir.validate);
        return dir;
    }
};
