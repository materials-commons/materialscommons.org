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
            status: 'active'
        });
        createExperimentSchema.validateAsync = promise.promisify(createExperimentSchema.validate);
        return createExperimentSchema;
    }

    function defineUpdateExperimentSchema() {
        let updateExperimentSchema = schema.defineSchema('UpdateExperiment', {
            name: {
                type: 'string',
                nullable: true
            },

            description: {
                type: 'string',
                nullable: true
            },

            notes: {
                type: 'string',
                nullable: true
            }
        });
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
            },
            index: {
                type: 'integer',
                nullable: false,
                min: 0
            }
        });

        createExperimentStepSchema.setDefaults({parent_id: '', description: ''});
        createExperimentStepSchema.validateAsync = promise.promisify(createExperimentStepSchema.validate);
        return createExperimentStepSchema;
    }

    function defineUpdateExperimentStepSchema() {
        let updateExperimentStepSchema = schema.defineSchema('UpdateExperimentStep', {
            name: {
                type: 'string',
                nullable: true
            },
            description: {
                type: 'string',
                nullable: true
            },
            notes: {
                type: 'string',
                nullable: true
            },
            parent_id: {
                type: 'string',
                nullable: true
            },
            flags: {
                nullable: true,
                done: {
                    type: 'boolean',
                    nullable: true
                },
                important: {
                    type: 'boolean',
                    nullable: true
                },
                error: {
                    type: 'boolean',
                    nullable: true
                },
                review: {
                    type: 'boolean',
                    nullable: true
                }
            },
            index: {
                type: 'integer',
                nullable: true,
                min: 0
            }
        });

        updateExperimentStepSchema.setDefaults({parent_id: ''});
        updateExperimentStepSchema.validateAsync = promise.promisify(updateExperimentStepSchema.validate);
        return updateExperimentStepSchema;
    }
};