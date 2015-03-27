var Schema = require('js-data-schema');
var schema = new Schema();
var promise = require('bluebird');


module.exports = function(model) {
    'use strict';

    let schemaRules = require('./schema-rules')(model);
    defineRules();
    let samples = defineSamplesSchema();
    samples.validateAsync = promise.promisify(samples.validate);
    samples.validateYield = promise.coroutine(function *(what) {
        yield samples.validateAsync(what);
    });

    return {
        samples: samples //defineSamplesSchema()
    };

    /////////////// Define Schemas ///////////////

    function defineSamplesSchema() {
        return schema.defineSchema('Sample', {
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
    }

    /////////////// Define Rules ///////////////

    function defineRules() {
        schema.defineRule('mustExist', schemaRules.mustExist, true);
        schema.defineRule('mustNotExist', schemaRules.mustNotExist, true);
    }
};
