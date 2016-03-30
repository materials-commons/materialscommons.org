module.exports = function(experiments, schema) {
    const parse = require('co-body');
    const status = require('http-status');

    return {
        getForProject,
        getSingle,
        getStep,
        createStep,
        updateStep,
        update,
        create
    };

    function* getForProject(next) {
        yield next;
    }

    function* getSingle(next) {
        yield next;
    }

    function* getStep(next) {
        yield next;
    }

    function* createStep(next) {
        yield next;
    }

    function* updateStep(next) {
        yield next;
    }

    function* update(next) {
        yield next;
    }

    function* create(next) {
        let experimentArgs = yield parse(this);
        schema.createExperiment.stripNonSchemaAttrs(experimentArgs);
        experimentArgs.project_id = this.params.project_id;
        let errors = yield schema.validate(schema.createExperiment, experimentArgs);
        if (errors != null) {
            this.status = status.BAD_REQUEST;
            this.body = errors;
        } else {
            let rv = yield experiments.create(experimentArgs);
            if (rv.error) {
                this.status = status.NOT_ACCEPTABLE;
                this.body = rv;
            } else {
                this.body = rv.val;
            }
        }
        yield next;
    }
};
