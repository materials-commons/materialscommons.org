module.exports = function(samples, schema) {
    'use strict';
    let ec = require('./error-code');
    let parse = require('co-body');
    const httpStatus = require('http-status');

    return {
        getAllSamplesForProject,
        getSampleForProject,
        createSample,
        updateSample
    };

    ///////////////////////////////////////

    function *getAllSamplesForProject(next) {
        let rv = yield samples.getList(this.params.project_id);
        if (rv.error) {
            this.throw(httpStatus.BAD_REQUEST, rv.error);
        }
        this.body = rv.val;
        this.status = 200;
        yield next;
    }

    function *getSampleForProject(next) {
        yield next;
    }

    // create creates a new sample. It validates the submitted
    // entry and enters default values in for optional missing
    // attributes.
    function *createSample(next) {
        try {
            let sample = prepareSample(yield parse(this));
            sample.project_id = this.params.project_id;
            sample.owner = this.reqctx.user.id;
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

        // validateSample validates the sample and any properties
        // included with the sample.
        function *validateSample(sample) {
            yield schema.samples.validateAsync(sample);
            for (let i = 0; i < sample.properties.length; i++) {
                yield schema.properties.validateAsync(sample.properties[i]);
            }
        }
    }

    function *updateSample(next) {
        'use strict';
        try {
            let fields = prepareSample(yield parse(this));
            fields.project_id = this.params.project_id;
            yield validateFields(fields);
            let updated = yield samples.update(this.params.sample_id, fields);
            this.status = 200;
            this.body = updated;
            yield next;
        } catch (err) {
            let e = ec(err);
            this.status = e.status();
            this.body = e.error();
        }

        //////////////

        // validateFields will validate the individual fields sent for
        // a sample and ignore missing fields.
        function *validateFields(fields) {
            yield schema.samples.validateAsync(fields, true);
            if ('properties' in fields) {
                for (let i = 0; i < fields.properties.length; i++) {
                    yield schema.properties.validateAsync(fields.properties[i], true);
                }
            }
        }
    }

    //////////////////////////////

    // prepareSample strips out unknown attributes and adds
    // default values for optional attributes.
    function prepareSample(sample) {
        schema.samples.stripNonSchemaAttrs(sample);
        schema.samples.addDefaultsToTarget(sample);
        return sample;
    }
};
