module.exports = function(schema) {
    const promise = require('bluebird');

    return {
        defineCreateExperimentSchema: defineCreateExperimentSchema,
        defineCreateExperimentStepSchema
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

        createExperimentSchema.setDefaults({
            aim: '',
            goal: '',
            description: '',
            status: 'in-progress'
        });
        createExperimentSchema.validateAsync = promise.promisify(createExperimentSchema.validate);
        return createExperimentSchema;
    }

    function defineCreateExperimentStepSchema() {
        let createExperimentStepSchema = schema.defineSchema('CreateExperimentStep', {
            name: {
                type: 'string',
                nullable: false
            },
            description: {
                type: 'string',
                nullable: false
            },
            parent_id: {
                type: 'string',
                nullable: false
            }
        });

        createExperimentStepSchema.setDefaults({parent_id: '', description: ''});
        createExperimentStepSchema.validateAsync = promise.promisify(createExperimentStepSchema.validate);
        return createExperimentStepSchema;
    }
};