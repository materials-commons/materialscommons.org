module.exports = function(experiments, schema) {
    const parse = require('co-body');
    const status = require('http-status');

    return {
        getAllForProject,
        get,
        getStep,
        createStep,
        updateStep,
        update,
        create
    };

    function* getAllForProject(next) {
        let rv = yield experiments.getAllForProject(this.params.project_id);
        if (rv.error) {
            this.body = rv;
            this.status = status.NOT_FOUND;
        } else {
            this.body = rv.val;
        }
        yield next;
    }

    function* get(next) {
        let isInProject = yield experiments.experimentExistsInProject(this.params.project_id, this.params.experiment_id);
        if (!isInProject) {
            this.status = status.NOT_FOUND;
        } else {
            let rv = yield experiments.get(this.params.experiment_id);
            if (rv.error) {
                this.body = rv;
                this.status = status.NOT_FOUND;
            } else {
                this.body = rv.val;
            }
        }
        yield next;
    }

    function* getStep(next) {
        let isValidStep = yield validateStep(this.params.project_id, this.params.experiment_id, this.params.step_id);
        if (!isValidStep) {
            this.status = status.NOT_FOUND;
            this.body = {error: 'Step not found'};
        }
        let rv = yield experiments.getStep(this.params.step_id);
        if (rv.error) {
            this.body = rv;
            this.status = status.NOT_FOUND;
        } else {
            this.body = rv.val;
        }
        yield next;
    }

    function* validateStep(projectID, experimentID, stepID) {
        let isInProject = yield experiments.experimentExistsInProject(projectID, experimentID);
        if (!isInProject) {
            return false;
        }

        return yield experiments.experimentStepExistsInExperiment(experimentID, stepID);
    }

    function* createStep(next) {
        let stepArgs = yield parse(this);
        schema.prepare(schema.createExperimentStep, stepArgs);
        let errors = yield validateCreateStepArgs(stepArgs, this.params.project_id,
            this.params.experiment_id, this.params.step_id);
        if (errors != null) {
            this.status = status.BAD_REQUEST;
            this.body = errors;
        } else {
            let rv = yield experiments.createStep(this.params.experiment_id, stepArgs, this.reqctx.user.id);
            if (rv.error) {
                this.status = status.NOT_ACCEPTABLE;
                this.body = rv;
            } else {
                this.body = rv.val;
            }
        }
        yield next;
    }

    function* validateCreateStepArgs(stepArgs, projectID, experimentID, stepID) {
        let errors = yield schema.validate(schema.createExperimentStep, stepArgs);
        if (errors !== null) {
            return errors;
        }

        let isInProject = yield experiments.experimentExistsInProject(projectID, experimentID);
        if (!isInProject) {
            return {error: 'Unknown experiment'};
        }

        if (stepID) {
            let isValidStepId = yield experiments.experimentStepExistsInExperiment(experimentID, stepID);
            if (!isValidStepId) {
                return {error: 'Unknown experiment step'};
            }
            stepArgs.parent_id = stepID;
        }

        return null;
    }

    function* updateStep(next) {
        yield next;
    }

    function* update(next) {
        let updateArgs = yield parse(this);
        let errors = yield validateUpdateExperimentArgs(updateArgs, this.params.project_id, this.params.experiment_id);
        if (errors != null) {
            this.status = status.BAD_REQUEST;
            this.body = errors;
        } else {
            let rv = yield experiments.update();
            if (rv.error) {
                this.status = status.BAD_REQUEST;
                this.body = errors;
            } else {
                this.body = rv.val;
            }
        }
        yield next;
    }

    function* validateUpdateExperimentArgs(experimentArgs, projectID, experimentID) {
        schema.prepare(schema.updateExperiment, experimentArgs);
        let errors = yield schema.validate(schema.updateExperiment, experimentArgs);
        if (errors != null) {
            return errors;
        }
        let isInProject = yield experiments.experimentExistsInProject(projectID, experimentID);
        return isInProject ? null : {error: 'No such experiment'};
    }

    function* create(next) {
        let experimentArgs = yield parse(this);
        schema.prepare(schema.createExperiment, experimentArgs);
        experimentArgs.project_id = this.params.project_id;
        let errors = yield schema.validate(schema.createExperiment, experimentArgs);
        if (errors != null) {
            this.status = status.BAD_REQUEST;
            this.body = errors;
        } else {
            let rv = yield experiments.create(experimentArgs, this.reqctx.user.id);
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
