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

            description: {
                type: 'string'
            }
        });

        createExperimentSchema.validateAsync = promise.promisify(createExperimentSchema.validate);
        return createExperimentSchema;
    }
};