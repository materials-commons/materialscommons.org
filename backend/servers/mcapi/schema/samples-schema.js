module.exports = function(schema) {
    const promise = require('bluebird');

    return {
        defineCreateSamplesSchema,
        defineAddSamplesMeasurementsSchema,
        defineUpdateSamplesMeasurementsSchema,
        defineSamplesMeasurementSchema,
        defineMeasurementSchema
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

    function defineAddSamplesMeasurementsSchema() {
        let addSamplesMeasurementsSchema = schema.defineSchema('AddSamplesMeasurementsSchema', {
            process_id: {
                type: 'string',
                nullable: false
            },

            properties: {
                type: 'array',
                nullable: false
            }
        });
        addSamplesMeasurementsSchema.setDefaults({});
        addSamplesMeasurementsSchema.validateAsync = promise.promisify(addSamplesMeasurementsSchema.validate);
        return addSamplesMeasurementsSchema;
    }

    function defineUpdateSamplesMeasurementsSchema() {
        let updateSamplesMeasurementsSchema = schema.defineSchema('UpdateSamplesMeasurementsSchema', {
            process_id: {
                type: 'string',
                nullable: false
            },

            properties: {
                type: 'array',
                nullable: false
            }
        });
        updateSamplesMeasurementsSchema.setDefaults({});
        updateSamplesMeasurementsSchema.validateAsync = promise.promisify(updateSamplesMeasurementsSchema.validate);
        return updateSamplesMeasurementsSchema;
    }

    function defineSamplesMeasurementSchema() {
        let samplesMeasurementsSchema = schema.defineSchema('SamplesMeasurementsSchema', {
            samples: {
                type: 'array',
                nullable: false
            },

            add_as: {
                type: 'string', // 'shared' or 'separate' defaults to 'separate'
                nullable: true
            },

            property: {
                nullable: false,
                attribute: {
                    type: 'string',
                    nullable: false
                },
                name: {
                    type: 'string',
                    nullable: false
                }
            },

            measurements: {
                type: 'array',
                nullable: false
            }
        });
        samplesMeasurementsSchema.setDefaults({
            add_as: 'shared'
        });
        samplesMeasurementsSchema.validateAsync = promise.promisify(samplesMeasurementsSchema.validate);
        return samplesMeasurementsSchema;
    }

    function defineMeasurementSchema() {
        let measurementSchema = schema.defineSchema('Measurement', {
            _type: {
                type: 'string',
                nullable: false
            },

            attribute: {
                type: 'string',
                nullable: false
            },

            is_best_measure: {
                type: 'boolean',
                nullable: true
            },

            name: {
                type: 'string',
                nullable: false
            },

            unit: {
                type: 'string',
                nullable: 'false'
            },

            value: {
                nullable: false
            },

            id: {
                type: 'string',
                nullable: true
            }
        });
        measurementSchema.setDefaults({
            is_best_measure: false
        });
        measurementSchema.validateAsync = promise.promisify(measurementSchema.validate);
        return measurementSchema;
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
