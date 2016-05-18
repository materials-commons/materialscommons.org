module.exports = function (schema) {
    const promise = require('bluebird');

    return {
        defineCreateExperimentSchema,
        defineUpdateExperimentSchema,
        defineCreateExperimentTaskSchema,
        defineUpdateExperimentTaskSchema,
        defineCreateExperimentNoteSchema,
        defineUpdateExperimentNoteSchema
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

            note: {
                type: 'string',
                nullable: true
            },

            goal: {
                type: 'string',
                nullable: false
            },

            index:{
                type: 'integer',
                nullable: false,
                min: 0
            },

            action: {
                type: 'string',
                nullable: false
            }
        });
        updateExperimentSchema.setDefaults({});
        updateExperimentSchema.validateAsync = promise.promisify(updateExperimentSchema.validate);
        return updateExperimentSchema;
    }

    function defineCreateExperimentTaskSchema() {
        let createExperimentTaskSchema = schema.defineSchema('CreateExperimentTask', {
            name: {
                type: 'string',
                nullable: false
            },
            note: {
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

        createExperimentTaskSchema.setDefaults({parent_id: '', note: ''});
        createExperimentTaskSchema.validateAsync = promise.promisify(createExperimentTaskSchema.validate);
        return createExperimentTaskSchema;
    }

    function defineUpdateExperimentTaskSchema() {
        let updateExperimentTaskSchema = schema.defineSchema('UpdateExperimentTask', {
            name: {
                type: 'string',
                nullable: true
            },
            note: {
                type: 'string',
                nullable: true
            },
            parent_id: {
                type: 'string',
                nullable: true
            },
            flags: {
                nullable: true,
                flagged: {
                    type: 'boolean',
                    nullable: true
                },
                done: {
                    type: 'boolean',
                    nullable: true
                },
                starred: {
                    type: 'boolean',
                    nullable: true
                }
            },

            swap: {
                nullable: true,
                task_id: {
                    type: 'string',
                    nullable: true
                }
            }
        });

        updateExperimentTaskSchema.setDefaults({parent_id: ''});
        updateExperimentTaskSchema.validateAsync = promise.promisify(updateExperimentTaskSchema.validate);
        return updateExperimentTaskSchema;
    }

    function defineCreateExperimentNoteSchema() {
        let createExperimentNoteSchema = schema.defineSchema('CreateExperimentNote', {
            name: {
                type: 'string',
                nullable: false
            },
            note: {
                type: 'string',
                nullable: false
            }
        });

        createExperimentNoteSchema.setDefaults({});
        createExperimentNoteSchema.validateAsync = promise.promisify(createExperimentNoteSchema.validate);
        return createExperimentNoteSchema;
    }

    function defineUpdateExperimentNoteSchema() {
        let updateExperimentNoteSchema = schema.defineSchema('UpdateExperimentNote', {
            name: {
                type: 'string'
            },
            note: {
                type: 'string'
            }
        });

        updateExperimentNoteSchema.setDefaults({});
        updateExperimentNoteSchema.validateAsync = promise.promisify(updateExperimentNoteSchema.validate);
        return updateExperimentNoteSchema;
    }
};