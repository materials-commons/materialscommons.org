module.exports = function(model) {
    const Schema = require('js-data-schema');
    const schema = new Schema();
    const promise = require('bluebird');

    let schemaRules = require('./schema-rules')(model);
    //let dataTypes = require('./schema-data-types');
    defineRules();

    let directorySchema = require('./directory-schema')(schema);

    return {
        samples: defineSamplesSchema(),
        transformedSamples: defineTransformedSamplesSchema(),
        processes: defineProcessSchema(),
        measurements: defineMeasurementsSchema(),
        createDirectory: directorySchema.defineCreateDirectorySchema(),
        model: model
    };

    /////////////// Define Schemas ///////////////

    function defineProcessSchema() {
        let process = schema.defineSchema('Process', {
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

            template_id: {
                type: 'string',
                nullable: false,
                mustExist: 'templates'
            },

            what: {
                type: 'string',
                nullable: true
            },

            how: {
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

            samples_created: {
                type: 'array',
                nullable: true
            },

            measurements_taken: {
                type: 'array',
                nullable: true
            },

            samples_transformed: {
                type: 'array',
                nullable: true
            },

            files_created: {
                type: 'array',
                nullable: true
            }
        });
        process.setDefaults({
            description: '',
            how: '',
            samples_created: [],
            measurements_taken: [],
            samples_transformed: [],
            files_created: []
        });
        process.validateAsync = promise.promisify(process.validate);
        return process;
    }

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
            name:{
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

    function defineMeasurementsSchema() {
        let measurements = schema.defineSchema('Measurements', {
            name: {
                type: 'string',
                nullable: false
            },

            attribute: {
                type: 'string',
                nullable: false
            },

            _type: {
                type: 'string',
                nullable: false,
                isValidPropertyType: true
            },

            value: {
                nullable: false
            },

            units: {
                type: 'string',
                nullable: false,
                isValidUnit: true
            },

            project_id: {
                type: 'string',
                nullable: true
            },

            sample_id: {
                type: 'string',
                nullable: false,
                mustExistInProject: 'samples'
            },

            attribute_id: {
                oneOf: 'attribute_id:attribute_set_id',
                mustBeForSample: 'attribute'
            },

            attribute_set_id: {
                oneOf: 'attribute_id:attribute_set_id',
                mustBeForSample: 'attributeset'
            },

            from_measurements: {
                type: 'array',
                nullable: true,
                mustBeValidMeasurements: true
            },

            from_file: {
                nullable: true,

                file_id: {
                    type: 'string',
                    nullable: false,
                    mustExistInProject: 'datafiles'
                },

                grid: {
                    nullable: true,

                    row_start: {
                        type: 'number',
                        nullable: false,
                        gtOrEq: 0
                    },

                    row_end: {
                        type: 'number',
                        nullable: false,
                        gtOrEq: 'row_start'
                    },

                    column_start: {
                        type: 'number',
                        nullable: false,
                        gtOrEq: 0
                    },

                    column_end: {
                        type: 'number',
                        nullable: false,
                        gtOrEq: 'column_start'
                    }
                },

                offset: {
                    nullable: true,

                    start: {
                        type: 'number',
                        nullable: false,
                        gtOrEq: 0
                    },

                    end: {
                        type: 'number',
                        nullable: false,
                        gtOrEq: 'start'
                    }
                }
            }
        });
        measurements.validateAsync = promise.promisify(measurements.validate);
        return measurements;
    }

    /////////////// Define Rules ///////////////

    function defineRules() {
        schema.defineRule('mustExist', schemaRules.mustExist, true);
        schema.defineRule('mustNotExist', schemaRules.mustNotExist, true);
        schema.defineRule('mustNotExistInProject',
                          schemaRules.mustNotExistInProject, true);
        schema.defineRule('mustExistInProject',
                          schemaRules.mustExistInProject, true);
        schema.defineRule('mustBeForSample',
                          schemaRules.mustBeForSample, true);
        schema.defineRule('mustBeForAttributeSet',
                          schemaRules.mustBeForAttributeSet, true);
        schema.defineRule('mustBeValidMeasurements',
                          schemaRules.mustBeValidMeasurements, true);
        schema.defineRule('isValidPropertyType', schemaRules.isValidPropertyType);
        schema.defineRule('isValidUnit', schemaRules.isValidUnit);
        schema.defineRule('oneOf', schemaRules.oneOf);
        schema.defineRule('mustNotStartWith', schemaRules.mustNotStartWith);
        schema.defineRule('mustNotExistInDirectory', schemaRules.mustNotExistInDirectory, true);
        schema.defineRule('mustNotExistInParentDirectory', schemaRules.mustNotExistInParentDirectory, true);
    }
};
