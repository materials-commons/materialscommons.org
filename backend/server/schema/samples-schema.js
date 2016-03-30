module.exports = function(schema) {
    const promise = require('bluebird');

    return {
        defineTransformedSamplesSchema: defineTransformedSamplesSchema,
        defineSamplesSchema: defineSamplesSchema
    };

    function defineTransformedSamplesSchema() {
        let transformed = schema.defineSchema('TransformedSamples', {
            sample_id: {
                type: 'string',
                nullable: false,
                mustExistInProject: 'samples:id'
            },
            attribute_set_id: {
                type: 'string',
                nullable: false,
                mustBelongToSample: true
            },
            uses: {
                type: 'array',
                nullable: true,
                mustBeForAttributeSet: true
            },
            shares: {
                type: 'array',
                nullable: true,
                mustBeForAttributeSet: true
            }
        });
        transformed.setDefaults({
            uses: [],
            shares: []
        });
        transformed.validateAsync = promise.promisify(transformed.validate);
        return transformed;
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
