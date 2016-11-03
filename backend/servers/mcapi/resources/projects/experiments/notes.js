const experiments = require('../../../db/model/experiments');
const status = require('http-status');
const schema = require('../../../schema');
const parse = require('co-body');
const _ = require('lodash');
const ra = require('../../resource-access');

function* getNotesForExperiment(next) {
    yield next;
}

function* getExperimentNote(next) {
    yield next;
}

function* updateExperimentNote(next) {
    let noteArgs = yield parse(this);
    schema.prepare(schema.updateExperimentNote, noteArgs);
    let errors = yield validateUpdateNoteArgs(noteArgs);
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

function* validateUpdateNoteArgs(noteArgs) {
    schema.prepare(schema.updateExperimentNote, noteArgs);
    let errors = yield schema.validate(schema.updateExperimentTask, noteArgs);
    if (errors != null) {
        return errors;
    }

    if (!_.has(noteArgs, 'note') && !_.has(noteArgs, 'name')) {
        return {error: 'At least a note or name field must be included'};
    }

    return null;
}

function* createExperimentNote(next) {
    let noteArgs = yield parse(this);
    schema.prepare(schema.createExperimentNote, noteArgs);
    let errors = yield validateCreateNoteArgs(noteArgs);
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

function* validateCreateNoteArgs(noteArgs) {
    let errors = yield schema.validate(schema.createExperimentNote, noteArgs);
    if (errors !== null) {
        return errors;
    }

    if (noteArgs.note === '') {
        noteArgs.note = 'Notes here...';
    }

    return null;
}

function* deleteExperimentNote(next) {
    let rv = yield experiments.deleteExperimentNote(this.params.note_id);
    if (rv.error) {
        this.status = status.NOT_ACCEPTABLE;
        this.body = rv;
    } else {
        this.body = rv.val;
    }
    yield next;
}

function createResources(router) {
    //router.get('/projects/:project_id/experiments/:experiment_id/notes',
    //    ra.validateProjectAccess, ra.validateExperimentInProject, experiments.getNotesForExperiment);
    //router.get('/projects/:project_id/experiments/:experiment_id/notes/:note_id',
    //    ra.validateProjectAccess, experiments.getExperimentNote);
    router.delete('/projects/:project_id/experiments/:experiment_id/notes/:note_id',
        ra.validateProjectAccess, ra.validateExperimentInProject, ra.validateNoteInExperiment,
        deleteExperimentNote);
    router.put('/projects/:project_id/experiments/:experiment_id/notes/:note_id',
        ra.validateProjectAccess, ra.validateExperimentInProject, ra.validateNoteInExperiment, updateExperimentNote);
    router.post('/projects/:project_id/experiments/:experiment_id/notes',
        ra.validateProjectAccess, ra.validateExperimentInProject, createExperimentNote);

}

module.exports = {
    createResources
};
