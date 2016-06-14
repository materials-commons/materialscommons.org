module.exports = function(samples, schema) {
    let parse = require('co-body');
    const status = require('http-status');

    return {
        getAllSamplesForProject,
        getSampleForProject,
        createSamples,
        updateSample,
        updateSamples
    };

    ///////////////////////////////////////

    function *getAllSamplesForProject(next) {
        let rv = yield samples.getAllSamplesForProject(this.params.project_id);
        if (rv.error) {
            this.throw(status.BAD_REQUEST, rv.error);
        }
        this.body = rv.val;
        this.status = 200;
        yield next;
    }

    function *getSampleForProject(next) {
        let isIn = yield samples.sampleInProject(this.params.project_id, this.params.sample_id);
        if (!isIn) {
            this.status = status.BAD_REQUEST;
            this.body = {error: `No such sample ${this.params.sample_id} in project ${this.params.project_id}`};
        } else {
            let rv = yield samples.getSample(this.params.sample_id);
            if (rv.error) {
                this.status = status.BAD_REQUEST;
                this.body = rv;
            } else {
                this.body = rv.val;
            }
        }

        yield next;
    }

    function* createSamples(next) {
        let createArgs = yield parse(this);
        let errors = yield validateCreateSamplesArgs(this.params.project_id, createArgs);
        if (errors != null) {
            this.status = status.BAD_REQUEST;
            this.body = errors;
        } else {
            let rv = yield samples.createSamples(this.params.project_id, createArgs.process_id, createArgs.samples,
                this.reqctx.user.id);
            if (rv.error) {
                this.status = status.BAD_REQUEST;
                this.body = rv;
            } else {
                this.body = rv.val;
            }
        }
        yield next;
    }

    function* validateCreateSamplesArgs(projectId, args) {
        schema.prepare(schema.createSamples, args);
        let errors = yield schema.validate(schema.createSamples, args);
        if (errors !== null) {
            return errors;
        }

        if (args.process_id === "") {
            return {error: 'Unknown process'};
        }

        let isCreateProcess = yield samples.isValidCreateSamplesProcess(projectId, args.process_id);
        if (!isCreateProcess) {
            return {error: `Process isn't a create samples process`};
        }

        if (args.samples.length === 0) {
            return {error: `No samples to be created`};
        }

        for (let i = 0; i < args.samples.length; i++) {
            let s = args.samples[i];
            if (!isValidSampleArg(s)) {
                return {error: `Bad sample request: ${s}`};
            }

            if (!s.description) {
                s.description = "";
            }
        }

        return null;
    }

    function isValidSampleArg(sample) {
        return !!(sample.name && sample.name !== "");
    }

    function *updateSample(next) {
        yield next;
    }

    function* updateSamples(next) {
        yield next;
    }
};
