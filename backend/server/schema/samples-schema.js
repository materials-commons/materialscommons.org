module.exports = function(schema) {
    const promise = require('bluebird');

    return {
        defineCreateSamplesSchema
    };

    function defineCreateSamplesSchema() {
        let createSamplesSchema = schema.defineSchema('CreateSamplesSchema', {
            process_id: {
                type: 'string',
                nullable: false
            },
            samples: {
                type: 'array',
                nullable: true
            }
        });
        createSamplesSchema.setDefaults({});
        createSamplesSchema.validateAsync = promise.promisify(createSamplesSchema.validate);
        return createSamplesSchema;
    }

    function defineSamplesSchema() {
        let samples = schema.defineSchema('Samples', {
            name: {
                type: 'string',
                nullable: false,
                mustNotExistInProject: 'samples:name'
            },
            project_id: {
                type: 'string',
                nullable: true
            },
            owner: {
                type: 'string',
                nullable: true
            },
            description: {
                type: 'string',
                nullable: true
            },
            properties: {
                type: 'array',
                nullable: true
            },
            sample_id: {
                type: 'string',
                nullable: true,
                mustExistInProject: 'samples'
            }
        });
        samples.setDefaults({
            description: '',
            properties: []
        });
        samples.validateAsync = promise.promisify(samples.validate);
        return samples;
    }
};
