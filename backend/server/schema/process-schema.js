module.exports = function(schema) {
    const promise = require('bluebird');

    return {
        defineProcessSchema: defineProcessSchema
    };

    function defineProcessSchema() {
        let process = schema.defineSchema('Process', {
            owner: {
                type: 'string',
                nullable: false
            },

            project_id: {
                type: 'string',
                nullable: false
            },

            name: {
                type: 'string',
                nullable: false
            },

            template_id: {
                type: 'string',
                nullable: false,
                mustExist: 'templates'
            },

            what: {
                type: 'string',
                nullable: true
            },

            how: {
                type: 'string',
                nullable: true
            },

            setup: {
                nullable: false,
                type: 'object',
                settings: {
                    type: 'array',
                    nullable: false
                },
                files: {
                    type: 'array',
                    nullable: false
                }
            },

            samples_created: {
                type: 'array',
                nullable: true
            },

            measurements_taken: {
                type: 'array',
                nullable: true
            },

            samples_transformed: {
                type: 'array',
                nullable: true
            },

            files_created: {
                type: 'array',
                nullable: true
            }
        });
        process.setDefaults({
            description: '',
            how: '',
            samples_created: [],
            measurements_taken: [],
            samples_transformed: [],
            files_created: []
        });
        process.validateAsync = promise.promisify(process.validate);
        return process;
    }
};
