module.exports = function(schema) {
    const promise = require('bluebird');

    return {
        defineMeasurementsSchema: defineMeasurementsSchema
    };

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
};
