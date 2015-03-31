module.exports = function(samples, schema) {
    'use strict';
    let ec = require('./error-code');
    let parse = require('co-body');

    return {
        all: all,
        byID: byID,
        create: create,
        update: update
    };

    function *all(next) {
        yield next;
    }

    function *byID(next) {
        yield next;
    }

    // create creates a new sample. It validates the submitted
    // entry and enters default values in for optional missing
    // attributes.
    function *create(next) {
        try {
            let sample = prepareSample(yield parse(this));
            yield validateSample(sample);
            let inserted = yield samples.create(sample);
            this.status = 200;
            this.body = inserted;
            yield next;
        } catch (err) {
            let e = ec(err);
            this.status = e.status();
            this.body = e.error();
        }

        /////////////////

        // prepareSample strips out unknown attributes and adds
        // default values for optional attributes.
        function prepareSample(sample) {
            schema.samples.stripNonSchemaAttrs(sample);
            schema.samples.addDefaultsToTarget(sample);
            return sample;
        }

        // validateSample validates the sample and any properties
        // included with the sample.
        function *validateSample(sample) {
            yield schema.samples.validateAsync(sample);
            for (let i = 0; i < sample.properties.length; i++) {
                yield schema.properties.validateAsync(sample.properties[i]);
            }
        }
    }

    function *update(next) {
        yield next;
    }
};
