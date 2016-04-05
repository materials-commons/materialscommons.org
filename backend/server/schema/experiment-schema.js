module.exports = function(schema) {
    const promise = require('bluebird');

    return {
        defineCreateExperimentSchema,
        defineUpdateExperimentSchema,
        defineCreateExperimentStepSchema,
        defineUpdateExperimentStepSchema
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

    function defineUpdateExperimentSchema() {
        let updateExperimentSchema = schema.defineSchema('UpdateExperiment', {
            name: {
                type: 'string'
            },

            description: {
                type: 'string'
            },

            notes: {
                type: 'string'
            },

            steps: {
                type: 'array'
            }
        });
        updateExperimentSchema.setDefaults({steps: []});
        updateExperimentSchema.validateAsync = promise.promisify(updateExperimentSchema.validate);
        return updateExperimentSchema;
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

    function defineUpdateExperimentStepSchema() {
        let updateExperimentStepSchema = schema.defineSchema('UpdateExperimentStep', {
            name: {
                type: 'string'
            },
            description: {
                type: 'string'
            },
            notes: {
                type: 'string'
            },
            parent_id: {
                type: 'string'
            },
            flags: {
                done: {
                    type: 'boolean'
                },
                important: {
                    type: 'boolean'
                },
                error: {
                    type: 'boolean'
                },
                review: {
                    type: 'boolean'
                }
            },
            steps: {
                type: 'array'
            }
        });

        updateExperimentStepSchema.setDefaults({steps: []});
        updateExperimentStepSchema.validateAsync = promise.promisify(updateExperimentStepSchema.validate);
        return updateExperimentStepSchema;
    }
};