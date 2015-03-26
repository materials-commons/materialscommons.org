var Schema = require('js-data-schema');
var schema = new Schema();

module.exports = function(model) {
    'use strict';

    defineRules();

    return {
        samples: defineSamplesSchema()
    };

    /////////////// Define Schemas ///////////////

    function defineSamplesSchema() {
        return schema.defineSchema('Sample', {
            name:{
                type: 'string',
                minLength: 1,
                exists: 'users' // this needs to be samples and not exist.
            },
            project_id: {
                type: 'string',
                minLength: 1
            },
            owner: {
                type: 'string',
                minLength: 1
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
        schema.defineRule('exists', validateExists, true);
    }

    function validateExists(what, modelName, done) {
        model[modelName].get(what).then(function(value) {
            let error = null;
            if (!value) {
                error = {
                    rule: 'exists',
                    actual: what,
                    expected: 'did not find ' + what + ' in model'
                };
            }
            done(error);
        });
    }

};
