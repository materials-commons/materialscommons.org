module.exports = function(schema) {
    const promise = require('bluebird');

    return {
        defineCreateExperimentSchema: defineCreateExperimentSchema
    };

    function defineCreateExperimentSchema() {
        let createExperimentSchema = schema.defineSchema('CreateExperiment', {
            project_id: {
                type: 'string',
                nullable: false
            },

            name: {
                type: 'string',
                nullable: false
                // mustNotExistInProject: 'experiments'
            },

            aim: {
                type: 'string',
                nullable: false
            },

            goal: {
                type: 'string',
                nullable: false
            },

            status: {
                type: 'string',
                nullable: false,
                isValidExperimentStatus: true
            },

            description: {
                type: 'string'
            }
        });

        createExperimentSchema.validateAsync = promise.promisify(createExperimentSchema.validate);
        return createExperimentSchema;
    }
};