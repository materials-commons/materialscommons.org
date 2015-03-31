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
        samples: defineSamplesSchema()
    };

    /////////////// Define Schemas ///////////////

    function defineSamplesSchema() {
        let samples = schema.defineSchema('Samples', {
            name:{
                type: 'string',
                minLength: 1,
                mustNotExist: 'samples:name'
            },
            project_id: {
                type: 'string',
                minLength: 1,
                mustExist: 'projects'
            },
            owner: {
                type: 'string',
                minLength: 1,
                mustExist: 'users'
            },
            description: {
                type: 'string',
                nullable: true
            },
            properties: {
                type: 'array',
                nullable: true
            }
        });
        samples.validateAsync = promise.promisify(samples.validate);
        return samples;
    }

    function definePropertiesSchema() {
        let properties = schema.defineSchema('Properties', {

        });
        properties.validateAsync = promise.promisify(properties.validate);
        return properties;
    }

    /////////////// Define Types ///////////////
    function defineTypes() {
        schema.defineDataType('Measurement', dataTypes.measurement);
    }

    /////////////// Define Rules ///////////////

    function defineRules() {
        schema.defineRule('mustExist', schemaRules.mustExist, true);
        schema.defineRule('mustNotExist', schemaRules.mustNotExist, true);
    }
};
