module.exports = function(experiments, schema) {
    const parse = require('co-body');
    const status = require('http-status');

    return {
        getAllExperimentsForProject,
        getExperiment,
        getExperimentTask,
        createExperimentTask,
        updateExperimentTask,
        deleteExperimentTask,
        updateExperiment,
        createExperiment,
        deleteExperiment
    };

    function* getAllExperimentsForProject(next) {
        let rv = yield experiments.getAllForProject(this.params.project_id);
        if (rv.error) {
            this.body = rv;
            this.status = status.NOT_FOUND;
        } else {
            this.body = rv.val;
        }
        yield next;
    }

    function* getExperiment(next) {
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

    function* getExperimentTask(next) {
        let isValidTask = yield validateTask(this.params.project_id, this.params.experiment_id, this.params.task_id);
        if (!isValidTask) {
            this.status = status.NOT_FOUND;
            this.body = {error: 'Task not found'};
        }
        let rv = yield experiments.getTask(this.params.task_id);
        if (rv.error) {
            this.body = rv;
            this.status = status.NOT_FOUND;
        } else {
            this.body = rv.val;
        }
        yield next;
    }

    function* validateTask(projectID, experimentID, taskID) {
        let isInProject = yield experiments.experimentExistsInProject(projectID, experimentID);
        if (!isInProject) {
            return false;
        }

        return yield experiments.experimentTaskExistsInExperiment(experimentID, taskID);
    }

    function* createExperimentTask(next) {
        let taskArgs = yield parse(this);
        schema.prepare(schema.createExperimentTask, taskArgs);
        let errors = yield validateCreateTaskArgs(taskArgs, this.params.project_id,
                                                  this.params.experiment_id, this.params.task_id);
        if (errors != null) {
            this.status = status.BAD_REQUEST;
            this.body = errors;
        } else {
            let rv = yield experiments.createTask(this.params.experiment_id, taskArgs, this.reqctx.user.id);
            if (rv.error) {
                this.status = status.NOT_ACCEPTABLE;
                this.body = rv;
            } else {
                this.body = rv.val;
            }
        }
        yield next;
    }

    function* validateCreateTaskArgs(taskArgs, projectID, experimentID, taskID) {
        let errors = yield schema.validate(schema.createExperimentTask, taskArgs);
        if (errors !== null) {
            return errors;
        }

        let isInProject = yield experiments.experimentExistsInProject(projectID, experimentID);
        if (!isInProject) {
            return {error: 'Unknown experiment'};
        }

        if (taskID) {
            let isValidTaskId = yield experiments.experimentTaskExistsInExperiment(experimentID, taskID);
            if (!isValidTaskId) {
                return {error: 'Unknown experiment task'};
            }
            taskArgs.parent_id = taskID;
        }

        return null;
    }

    function* updateExperimentTask(next) {
        let updateTaskArgs = yield parse(this);
        let errors = yield validateUpdateTaskArgs(updateTaskArgs, this.params.project_id,
                                                  this.params.experiment_id, this.params.task_id);
        if (errors != null) {
            this.status = status.BAD_REQUEST;
            this.body = errors;
        } else {
            let rv = yield experiments.updateTask(this.params.task_id, updateTaskArgs);
            if (rv.error) {
                this.status = status.BAD_REQUEST;
                this.body = rv;
            } else {
                this.body = rv.val;
            }
        }
        yield next;
    }

    function* validateUpdateTaskArgs(args, projectID, experimentID, taskID) {
        schema.prepare(schema.updateExperimentTask, args);
        let errors = yield schema.validate(schema.updateExperimentTask, args);
        if (errors != null) {
            return errors;
        }

        let isInProject = yield experiments.experimentExistsInProject(projectID, experimentID);
        if (!isInProject) {
            return {error: 'No such experiment'};
        }

        let isValidTaskId = yield experiments.experimentTaskExistsInExperiment(experimentID, taskID);
        if (!isValidTaskId) {
            return {error: 'Unknown experiment task'};
        }

        if (args.parent_id !== '') {
            let parentIdInExperiment = yield experiments.experimentTaskExistsInExperiment(experimentID, args.parent_id);
            if (!parentIdInExperiment) {
                return {error: 'Invalid parent task'};
            }
        }

        if (args.swap) {
            if (!args.swap.task_id) {
                return {error: 'No swap task identified'};
            }

            if (args.swap.task_id === taskID) {
                return {error: 'Cannot swap task with itself'};
            }

            let swapIdExistsInExperiment = yield experiments.experimentTaskExistsInExperiment(experimentID, args.swap.task_id);
            if (!swapIdExistsInExperiment) {
                return {error: 'Invalid swap task'};
            }
        }

        return null;
    }

    function* deleteExperimentTask(next) {
        let error = yield validateDeleteTask(this.params.project_id, this.params.experiment_id, this.params.task_id);
        if (error != null) {
            this.body = error;
            this.status = status.BAD_REQUEST;
        } else {
            let rv = yield experiments.deleteTask(this.params.experiment_id, this.params.task_id);
            if (rv.error) {
                this.body = rv;
                this.status = status.BAD_REQUEST;
            } else {
                this.body = rv.val;
            }
        }

        yield next;
    }

    function* validateDeleteTask(projectID, experimentID, taskID) {
        let isInProject = yield experiments.experimentExistsInProject(projectID, experimentID);
        if (!isInProject) {
            return {error: 'No such experiment'};
        }

        let isValidTaskId = yield experiments.experimentTaskExistsInExperiment(experimentID, taskID);
        if (!isValidTaskId) {
            return {error: 'Unknown experiment task'};
        }

        let isUsingProcess = yield experiments.taskIsUsingProcess(taskID);
        if (isUsingProcess) {
            return {error: `Cannot delete task associated with a process`};
        }

        return null;
    }

    function* updateExperiment(next) {
        let updateArgs = yield parse(this);
        let errors = yield validateUpdateExperimentArgs(updateArgs, this.params.project_id, this.params.experiment_id);
        if (errors != null) {
            this.status = status.BAD_REQUEST;
            this.body = errors;
        } else {
            let rv = yield experiments.update(this.params.experiment_id, updateArgs);
            if (rv.error) {
                this.status = status.BAD_REQUEST;
                this.body = rv;
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

    function* createExperiment(next) {
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

    function* deleteExperiment(next) {
        yield next;
    }
};
