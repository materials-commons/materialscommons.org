const status = require('http-status');
const Router = require('koa-router');
const parse = require('co-body');
const ra = require('./resource-access');
const model = require('../db/model/model');
const _ = require('lodash');

const notes = require('../db/model/notes');

function* createNote(next) {
    let note = yield parse(this);
    let errors = yield validateNote(note, this.reqctx.user);
    if (errors !== null) {
        this.status = status.BAD_REQUEST;
        this.body = errors;
    } else {
        let n = new model.Note(note.title, note.note, this.reqctx.user.id);
        let createdNote = yield notes.createNote(n, note.item_type, note.item_id);
        this.body = createdNote;
    }

    yield next;
}

function* validateNote(note, user) {
    if (!note.title) {
        note.title = '';
    }

    if (!note.note) {
        note.note = '';
    }

    if (!note.item_type) {
        return {error: `Note must be associated with an object in the system 1`};
    }

    if (note.item_type !== 'project') {
        return {error: `Notes may only be associated with projects`};
    }

    if (!note.item_id) {
        return {error: `Note must be associated with an object in the system 2`};
    }

    ra.checkProjectAccess(note.item_id, user);
    return null;
}

function* updateNote(next) {
    let note = yield parse(this);
    let errors = yield validateNote(note, this.reqctx.user);
    if (errors !== null) {
        this.status = status.BAD_REQUEST;
        this.body = errors;
    } else {
        let n = new model.Note(note.title, note.note, this.reqctx.user.id);
        n.id = this.params.note_id;
        console.log('calling updateNote with', n);
        let updatedNote = yield notes.updateNote(n);
        this.body = updatedNote;
    }

    yield next;
}

function* deleteNote(next) {
    let n = yield parse(this);
    let errors = validateDelete(n);
    if (error != null) {
        this.status = status.BAD_REQUEST;
        this.body = errors;
    } else {
        ra.checkProjectAccess(n.item_id, this.reqctx.user);
        yield notes.deleteNote(this.param.note_id);
    }

    yield next;
}

function validateDelete(n) {
    if (!note.item_type) {
        return {error: `Note must be associated with an object in the system`};
    }

    if (note.item_type !== 'project') {
        return {error: `Notes may only be associated with projects`};
    }

    if (!note.item_id) {
        return {error: `Note must be associated with an object in the system`};
    }

    return null;
}

function createResource() {
    const router = new Router();

    router.post('/', createNote);
    router.put('/:note_id', updateNote);
    router.delete('/:note_id', deleteNote);

    return router;
}

module.exports = {
    createResource
};
