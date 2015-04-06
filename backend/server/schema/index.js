var Schema = require('js-data-schema');
var schema = new Schema();
var promise = require('bluebird');


module.exports = function(model) {
    'use strict';

    let schemaRules = require('./schema-rules')(model);
    let dataTypes = require('./schema-data-types');
    defineTypes();
    defineRules();

    return {
        samples: defineSamplesSchema(),
        properties: definePropertiesSchema()
    };

    /////////////// Define Schemas ///////////////

    function defineProcessSchema() {
        let process = schema.defineSchema('Process', {
            owner: {
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
            description: {
                type: 'string',
                nullable: true
            },
            how: {
                type: 'string',
                nullable: true
            },
            settings: {
                type: 'array',
                nullable: false
            },
            files_created: {
                type: 'array',
                nullable: true
            },
            files_used: {
                type: 'array',
                nullable: true
            },
            samples_created: {
                type: 'array',
                nullable: true
            },
            samples_used: {
                type: 'array',
                nullable: true
            },
            measurements: {
                type: 'array',
                nullable: true
            }
        });
        process.setDefaults({
            description: '',
            how: '',
            files_created: [],
            files_used: [],
            samples_created: [],
            samples_used: [],
            measurements: []
        });
        process.validateAsync = promise.promisify(process.validate);
        return process;
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
                nullable: false
            },
            owner: {
                type: 'string',
                nullable: false
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

    function definePropertiesSchema() {
        let properties = schema.defineSchema('Properties', {
            name: {
                type: 'string',
                nullable: false
            },
            _type: {
                type: 'string',
                minLength: 1,
                isValidPropertyType: true
            },
            value: {
                nullable: false
            },
            units: {
                type: 'string',
                minLength: 1,
                isValidUnit: true
            },
            measurement_id: {
                type: 'string',
                nullable: false
                //mustExist: 'measurements'
            }
        });
        properties.validateAsync = promise.promisify(properties.validate);
        return properties;
    }

    function defineMeasurementsSchema() {
        let measurements = schema.defineSchema('Measurement', {
            name: {
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

            nvalue: {
                nullable: true
            },

            nunits: {
                nullable: true
            },

            file: {
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
                        nullable: false
                    },

                    row_end: {
                        type: 'number',
                        nullable: false
                    },

                    column_start: {
                        type: 'number',
                        nullable: false
                    },

                    column_end: {
                        type: 'number',
                        nullable: false
                    }
                },

                offset: {
                    nullable: true,

                    start: {
                        type: 'number',
                        nullable: false
                    },

                    end: {
                        type: 'number',
                        nullable: false
                    }
                }
            }
        });
        measurements.validateAsync = promise.promisify(measurements.validate);
        return measurements;
    }

    /////////////// Define Types ///////////////

    function defineTypes() {
        schema.defineDataType('Measurement', dataTypes.measurement);
    }

    /////////////// Define Rules ///////////////

    function defineRules() {
        schema.defineRule('mustExist', schemaRules.mustExist, true);
        schema.defineRule('mustNotExist', schemaRules.mustNotExist, true);
        schema.defineRule('mustNotExistInProject',
                          schemaRules.mustNotExistInProject, true);
        schema.defineRule('mustExistInProject',
                          schemaRules.mustExistInProject, true);
        schema.defineRule('isValidPropertyType', schemaRules.isValidPropertyType);
        schema.defineRule('isValidUnit', schemaRules.isValidUnit);
    }
};
