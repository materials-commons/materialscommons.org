module.exports = function(experiments, samples, schema) {
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
        getProcessesForExperiment,
        getFilesForExperiment,
        createProcessInExperimentFromTemplate,
        updateExperimentProcess
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
        let errors = yield validateExperimentTaskAccess(projectID, experimentID, taskID);
        if (errors !== null) {
            return errors;
        }

        let isUnused = yield experiments.taskProcessIsUnused(taskID);
        if (!isUnused) {
            return {error: `Cannot delete task associated with a process that is being used`};
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

    function* updateExperimentProcess(next) {
        let updateArgs = yield parse(this);
        updateArgs.process_id = this.params.process_id;
        let errors = yield validateUpdateExperimentProcessTemplateArgs(updateArgs, this.params);
        if (errors != null) {
            this.status = status.BAD_REQUEST;
            this.body = errors;
        } else {
            let rv = yield experiments.updateProcess(this.params.experiment_id, this.params.process_id,
                updateArgs.properties, updateArgs.files, updateArgs.samples);
            if (rv.error) {
                this.status = status.BAD_REQUEST;
                this.body = rv;
            } else {
                this.body = rv.val;
            }
        }

        yield next;
    }

    function* validateUpdateExperimentProcessTemplateArgs(updateArgs, params) {
        if (updateArgs.properties && !_.isArray(updateArgs.properties)) {
            return {error: `Properties attribute isn't an array`};
        }

        if (updateArgs.process_id) {
            let isTemplateForProcess = yield experiments.isTemplateForProcess(updateArgs.template_id, updateArgs.process_id);
            if (!isTemplateForProcess) {
                return {error: `Incorrect template for process; template: ${updateArgs.template_id} process: ${params.process_id}`};
            }
        }

        let template = yield experiments.getTemplate(updateArgs.template_id);

        if (updateArgs.properties) {
            for (let i = 0; i < updateArgs.properties.length; i++) {
                let property = updateArgs.properties[i];
                let errors = yield validateProperty(template, property);
                if (errors !== null) {
                    return errors;
                }
            }
        }

        if (updateArgs.files && !_.isArray(updateArgs.files)) {
            return {error: `Files attribute isn't an array`};
        }

        if (updateArgs.files && !updateArgs.process_id) {
            return {error: `Must supply a process when including files`};
        }

        if (updateArgs.files) {
            for (let i = 0; i < updateArgs.files.length; i++) {
                let f = updateArgs.files[i];
                let errors = yield validateFile(params.project_id, f);
                if (errors !== null) {
                    return errors;
                }
            }
        }

        if (updateArgs.samples && !_.isArray(updateArgs.samples)) {
            return {error: `Samples attribute isn't an array`};
        }

        if (updateArgs.samples && !updateArgs.process_id) {
            return {error: `Must supply a process when including samples`};
        }

        if (updateArgs.samples) {
            for (let i = 0; i < updateArgs.samples.length; i++) {
                let s = updateArgs.samples[i];
                let errors = yield validateSample(params.project_id, s);
                if (errors !== null) {
                    return errors;
                }
            }
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
            let rv = yield experiments.updateTaskTemplate(this.params.task_id, this.params.experiment_id, updateArgs.process_id,
                updateArgs.properties, updateArgs.files, updateArgs.samples);
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
        if (updateArgs.properties && !_.isArray(updateArgs.properties)) {
            return {error: `Properties attribute isn't an array`};
        }

        let isValid = yield validateTask(params.project_id, params.experiment_id, params.task_id);
        if (!isValid) {
            return {error: 'Bad experiment or task'};
        }

        let isTemplateForTask = yield experiments.isTemplateForTask(updateArgs.template_id, params.task_id);
        if (!isTemplateForTask) {
            return {error: `Incorrect template for task; template: ${updateArgs.template_id} task: ${params.task_id}`};
        }

        let template = yield experiments.getTemplate(updateArgs.template_id);

        if (updateArgs.properties) {
            for (let i = 0; i < updateArgs.properties.length; i++) {
                let property = updateArgs.properties[i];
                let errors = yield validateProperty(template, property);
                if (errors !== null) {
                    return errors;
                }
            }
        }

        if (updateArgs.files && !_.isArray(updateArgs.files)) {
            return {error: `Files attribute isn't an array`};
        }

        if (updateArgs.files && !updateArgs.process_id) {
            return {error: `Must supply a process when including files`};
        }

        if (updateArgs.files) {
            for (let i = 0; i < updateArgs.files.length; i++) {
                let f = updateArgs.files[i];
                let errors = yield validateFile(params.project_id, f);
                if (errors !== null) {
                    return errors;
                }
            }
        }

        if (updateArgs.samples && !_.isArray(updateArgs.samples)) {
            return {error: `Samples attribute isn't an array`};
        }

        if (updateArgs.samples && !updateArgs.process_id) {
            return {error: `Must supply a process when including samples`};
        }

        if (updateArgs.samples) {
            for (let i = 0; i < updateArgs.samples.length; i++) {
                let s = updateArgs.samples[i];
                let errors = yield validateSample(params.project_id, s);
                if (errors !== null) {
                    return errors;
                }
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

    function* validateFile(projectId, file) {
        let errors = yield schema.validate(schema.templateCommand, file);
        if (errors !== null) {
            return errors;
        }

        if (file.command !== 'add' && file.command !== 'delete') {
            return {error: `Bad command '${file.command} for file ${file.id}`};
        }

        let fileInProject = yield experiments.fileInProject(file.id, projectId);
        if (!fileInProject) {
            return {error: `File ${file.id} not in project ${projectId}`};
        }

        return null;
    }

    function* validateSample(projectId, sample) {
        let errors = yield schema.validate(schema.templateCommand, sample);
        if (errors !== null) {
            return errors;
        }

        if (sample.command !== 'add' && sample.command !== 'delete') {
            return {error: `Bad command '${sample.command} for file ${sample.id}`}
        }

        if (sample.property_set_id === '') {
            return {error: `A valid property set must be supplied`};
        }

        let sampleInProject = yield samples.sampleInProject(projectId, sample.id);
        if (!sampleInProject) {
            return {error: `Sample ${sample.id} not in project ${projectId}`}
        }

        let sampleHasPropertySet = yield samples.sampleHasPropertySet(sample.id, sample.property_set_id);
        if (!sampleHasPropertySet) {
            return {error: `Sample ${sample.id} doesn't have property set ${sample.property_set_id}`};
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
        for (let prop in experimentArgs) {
            if (prop !== 'name' || prop !== 'description' || prop !== 'note') {
                if (!allEntriesAreStrings(experimentArgs[prop])) {
                    return {error: `${prop} entries must all be of type string`};
                }
            }

            if (prop === 'status') {
                let status = experimentArgs.status;
                if (status !== 'active' && status !== 'done' && status !== 'on-hold') {
                    return {error: `Invalid experiment status ${status}`};
                }
            }
        }

        let isInProject = yield experiments.experimentExistsInProject(projectID, experimentID);
        return isInProject ? null : {error: 'No such experiment'};
    }

    function allEntriesAreStrings(items) {
        for (let item in items) {
            if (!_.isString(item)) {
                return false;
            }
        }

        return true;
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

    function *getProcessesForExperiment(next) {
        let isInProject = yield experiments.experimentExistsInProject(this.params.project_id, this.params.experiment_id);
        if (!isInProject) {
            this.body = {error: `No such experiment`};
            this.status = status.BAD_REQUEST;
        } else {
            let rv = yield experiments.getProcessesForExperiment(this.params.experiment_id);
            if (rv.error) {
                this.status = status.BAD_REQUEST;
                this.body = rv;
            } else {
                this.body = rv.val;
            }
        }
        yield next;
    }

    function *getFilesForExperiment(next) {
        let isInProject = yield experiments.experimentExistsInProject(this.params.project_id, this.params.experiment_id);
        if (!isInProject) {
            this.body = {error: `No such experiment`};
            this.status = status.BAD_REQUEST;
        } else {
            let rv = yield experiments.getFilesForExperiment(this.params.experiment_id);
            if (rv.error) {
                this.status = status.BAD_REQUEST;
                this.body = rv;
            } else {
                this.body = rv.val;
            }
        }
        yield next;
    }

    function* createProcessInExperimentFromTemplate(next) {
        let errors = yield validateCreateProcessInExperimentRequest(this.params.template_id);
        if (errors != null) {
            this.status = status.BAD_REQUEST;
            this.body = errors;
        } else {
            let rv = yield experiments.addProcessFromTemplate(this.params.project_id, this.params.experiment_id,
                this.params.template_id, this.reqctx.user.id);
            if (rv.error) {
                this.status = status.BAD_REQUEST;
                this.body = rv;
            } else {
                this.body = rv.val;
            }
        }
        yield next;
    }

    function* validateCreateProcessInExperimentRequest(template_id) {
        let templateExists = yield experiments.templateExists(template_id);
        if (!templateExists) {
            return {error: 'No such template'};
        }
        return null;
    }
};
