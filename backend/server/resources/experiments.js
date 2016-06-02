module.exports = function (experiments, schema) {
    const parse = require('co-body');
    const status = require('http-status');
    const _ = require('lodash');
    const propertyValidator = require('../schema/property-validator');

    return {
        getAllExperimentsForProject,
        getExperiment,
        getExperimentTask,
        createExperimentTask,
        updateExperimentTask,
        deleteExperimentTask,
        addExperimentTaskTemplate,
        updateExperimentTaskTemplate,
        updateExperiment,
        createExperiment,
        deleteExperiment,
        getNotesForExperiment,
        getExperimentNote,
        updateExperimentNote,
        createExperimentNote,
        deleteExperimentNote,
        createExperimentGoal
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
        let errors = yield yield validateExperimentTaskAccess(projectID, experimentID, taskID);
        if (errors !== null) {
            return errors;
        }

        let isUsingProcess = yield experiments.taskIsUsingProcess(taskID);
        if (isUsingProcess) {
            return {error: `Cannot delete task associated with a process`};
        }

        return null;
    }

    function* addExperimentTaskTemplate(next) {
        let errors = yield validateAddExperimentTaskRequest(this.params);
        if (errors != null) {
            this.status = status.BAD_REQUEST;
            this.body = errors;
        } else {
            let rv = yield experiments.addTemplateToTask(this.params.project_id, this.params.experiment_id,
                this.params.task_id, this.params.template_id, this.reqctx.user.id);
            if (rv.error) {
                this.status = status.BAD_REQUEST;
                this.body = rv;
            } else {
                this.body = rv.val;
            }
        }

        yield next;
    }

    function* validateAddExperimentTaskRequest(params) {
        let isValid = yield validateTask(params.project_id, params.experiment_id, params.task_id);
        if (!isValid) {
            return {error: 'Bad experiment or task'};
        }

        let templateExists = yield experiments.templateExists(params.template_id);
        if (!templateExists) {
            return {error: 'No such template'};
        }

        return null;
    }

    function* updateExperimentTaskTemplate(next) {
        let updateArgs = yield parse(this);
        let errors = yield validateUpdateExperimentTaskTemplateArgs(updateArgs, this.params);
        if (errors != null) {
            this.status = status.BAD_REQUEST;
            this.body = errors;
        } else {
            let rv = yield experiments.updateTaskTemplateProperties(this.params.task_id, updateArgs.properties);
            if (rv.error) {
                this.status = status.BAD_REQUEST;
                this.body = rv;
            } else {
                this.body = rv.val;
            }
        }

        yield next;
    }

    function* validateUpdateExperimentTaskTemplateArgs(updateArgs, params) {
        let isValid = yield validateTask(params.project_id, params.experiment_id, params.task_id);
        if (!isValid) {
            return {error: 'Bad experiment or task'};
        }

        let isTemplateForTask = yield experiments.isTemplateForTask(updateArgs.template_id, params.task_id);
        if (!isTemplateForTask) {
            return {error: 'Incorrect template for task'};
        }

        let template = yield experiments.getTemplate(updateArgs.template_id);

        for (let i = 0; i < updateArgs.properties.length; i++) {
            let property = updateArgs.properties[i];
            let errors = yield validateProperty(template, property);
            if (errors !== null) {
                return errors;
            }
        }

        return null;
    }

    function* validateProperty(template, property) {
        let errors = yield schema.validate(schema.templateProperty, property);
        if (errors !== null) {
            return errors;
        }

        if (!propertyValidator.isValidSetupProperty(template, property)) {
            return {error: `Invalid property ${property.attribute}`};
        }

        return null;
    }

    function* updateExperiment(next) {
        let updateArgs = yield parse(this);
        let updated_exp;
        let errors = yield validateUpdateExperimentArgs(updateArgs, this.params.project_id, this.params.experiment_id);
        if (errors != null) {
            this.status = status.BAD_REQUEST;
            this.body = errors;
        } else {
            let exp = yield experiments.get(this.params.experiment_id);
            delete exp.val['tasks'];
            updated_exp = updateExp(exp, updateArgs, 'goal', 'goals');
            updated_exp = updateExp(updated_exp, updateArgs, 'collaborator', 'collaborators');
            updated_exp = updateExp(updated_exp, updateArgs, 'funder', 'funding');
            updated_exp = updateExp(updated_exp, updateArgs, 'paper', 'working_papers');
            updated_exp = updateExp(updated_exp, updateArgs, 'publication', 'publications');
            updated_exp = updateExp(updated_exp, updateArgs, 'citation', 'citations');

            let rv = yield experiments.update(this.params.experiment_id, updated_exp.val);
            if (rv.error) {
                this.status = status.BAD_REQUEST;
                this.body = rv;
            } else {
                this.body = rv.val;
            }
        }
        yield next;
    }

    function updateExp(exp, updateArgs, what, db_field) {
        if (what in updateArgs) {
            if (updateArgs['action'] === 'add') {
                exp.val[db_field][updateArgs['index']] = updateArgs[what];
            } else {
                exp.val[db_field].splice(updateArgs['index'], 1);
            }
        }
        return exp;
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


    function* getNotesForExperiment(next) {
        yield next;
    }

    function* getExperimentNote(next) {
        yield next;
    }

    function* updateExperimentNote(next) {
        let noteArgs = yield parse(this);
        schema.prepare(schema.updateExperimentNote, noteArgs);
        let errors = yield validateUpdateNoteArgs(noteArgs, this.params.project_id, this.params.experiment_id, this.params.note_id);
        if (errors !== null) {
            this.status = status.BAD_REQUEST;
            this.body = errors;
        } else {
            let rv = yield experiments.updateExperimentNote(this.params.note_id, noteArgs);
            if (rv.error) {
                this.status = status.NOT_ACCEPTABLE;
                this.body = rv;
            } else {
                this.body = rv.val;
            }
        }
        yield next;
    }

    function* validateUpdateNoteArgs(noteArgs, projectID, experimentID, noteID) {
        schema.prepare(schema.updateExperimentNote, noteArgs);
        let errors = yield schema.validate(schema.updateExperimentTask, noteArgs);
        if (errors != null) {
            return errors;
        }

        if (!_.has(noteArgs, 'note') && !_.has(noteArgs, 'name')) {
            return {error: 'At least a note or name field must be included'};
        }

        return yield validateExperimentNoteAccess(projectID, experimentID, noteID);
    }

    function* createExperimentNote(next) {
        let noteArgs = yield parse(this);
        schema.prepare(schema.createExperimentNote, noteArgs);
        let errors = yield validateCreateNoteArgs(noteArgs, this.params.project_id, this.params.experiment_id);
        if (errors !== null) {
            this.status = status.BAD_REQUEST;
            this.body = errors;
        } else {
            let rv = yield experiments.createExperimentNote(this.params.experiment_id, this.reqctx.user.id, noteArgs);
            if (rv.error) {
                this.status = status.NOT_ACCEPTABLE;
                this.body = rv;
            } else {
                this.body = rv.val;
            }
        }
        yield next;
    }

    function* validateCreateNoteArgs(noteArgs, projectID, experimentID) {
        let errors = yield schema.validate(schema.createExperimentNote, noteArgs);
        if (errors !== null) {
            return errors;
        }

        if (noteArgs.note === '') {
            noteArgs.note = 'Notes here...';
        }

        return yield validateExperimentNoteAccess(projectID, experimentID);
    }

    function* deleteExperimentNote(next) {
        let errors = yield validateExperimentNoteAccess(this.params.project_id, this.params.experiment_id, this.params.note_id);
        if (errors != null) {
            this.status = status.BAD_REQUEST;
            this.body = errors;
        } else {
            let rv = yield experiments.deleteExperimentNote(this.params.note_id);
            if (rv.error) {
                this.status = status.NOT_ACCEPTABLE;
                this.body = rv;
            } else {
                this.body = rv.val;
            }
        }
        yield next;
    }

    ///////////////////////////

    function* validateExperimentNoteAccess(projectID, experimentID, noteID) {
        let isInProject = yield experiments.experimentExistsInProject(projectID, experimentID);
        if (!isInProject) {
            return {error: 'Unknown experiment'};
        }

        if (noteID) {
            let isValidNoteId = yield experiments.experimentNoteExistsInExperiment(experimentID, noteID);
            if (!isValidNoteId) {
                return {error: 'Unknown experiment note'};
            }
        }

        return null;
    }

    function* validateExperimentTaskAccess(projectID, experimentID, taskID) {
        let isInProject = yield experiments.experimentExistsInProject(projectID, experimentID);
        if (!isInProject) {
            return {error: 'Unknown experiment'};
        }

        if (taskID) {
            let isValidTaskId = yield experiments.experimentTaskExistsInExperiment(experimentID, taskID);
            if (!isValidTaskId) {
                return {error: 'Unknown experiment task'};
            }
        }

        return null;
    }

    function* createExperimentGoal(next) {
        let goalArgs = yield parse(this);
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
};
