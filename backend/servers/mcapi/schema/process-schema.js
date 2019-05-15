module.exports = function(schema) {
    const promise = require('bluebird');

    return {
        defineCreateProcessSchema,
        defineCreateProcessSetupSchema,
        defineUpdateProcessSchema
    };

    function defineCreateProcessSchema() {
        let createProcessSchema = schema.defineSchema('CreateProcess', {
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

            description: {
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

            input_samples: {
                type: 'array',
                nullable: false
            },

            output_samples: {
                type: 'array',
                nullable: false
            },

            transformed_samples: {
                type: 'array',
                nullable: false
            },

            input_files: {
                type: 'array',
                nullable: false
            },

            output_files: {
                type: 'array',
                nullable: false
            }
        });

        createProcessSchema.setDefaults({
            description: '',
            input_samples: [],
            output_samples: [],
            transformed_samples: [],
            input_files: [],
            output_files: []
        });
        createProcessSchema.validateAsync = promise.promisify(createProcessSchema.validate);
        return createProcessSchema;
    }

    function defineCreateProcessSetupSchema() {
        let createSetupSchema = schema.defineSchema('CreateProcessSetup', {
            name: {
                type: 'string',
                minLength: 1,
                nullable: false
            },

            attribute: {
                type: 'string',
                nullable: false
            },

            properties: {
                type: 'array',
                nullable: false,
                isValidProperties: true
            }
        });

        createSetupSchema.setDefaults({});
        createSetupSchema.validateAsync = promise.promisify(createSetupSchema.validate);
        return createSetupSchema;

    }

    function defineUpdateProcessSchema() {
        let updateProcessSchema = schema.defineSchema('UpdateProcess', {
            name: {type: 'string', nullable: true},
            description: {type: 'string', nullable: true},
            template_id: {type: 'string', nullable: true},
            ptype: {type: 'string', nullable: true},
            properties: {type: 'array', nullable: true},
            files: {type: 'array', nullable: true},
            samples: {type: 'array', nullable: true}
        });
        updateProcessSchema.setDefaults({
            properties: [],
            files: [],
            samples: []
        });
        updateProcessSchema.validateAsync = promise.promisify(updateProcessSchema.validate);
        return updateProcessSchema;
    }
};
