module.exports = function(samples, samplesSchema) {
    'use strict';

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

    function *create(next) {
        try {
            let sample = yield parse(this);
            samplesSchema.stripNonSchemaAttrs(sample);
            yield samplesSchema.validateAsync(sample);
            let inserted = yield samples.create(sample);
            this.status = 200;
            this.body = inserted;
            yield next;
        } catch (err) {
            this.status = 406;
            this.body = 'bad sample definition';
        }
    }

    function *update(next) {
        yield next;
    }
};
