const r = require('../r');
const model = require('./model');
const db = require('./db');

function* createNote(note, itemType, itemId) {
    let note = yield db.insert('notes', note);
    let n2i = new model.Note2Item(itemId, itemId, note.id);
    yield db.insert('note2item', n2i);
    return note;
}

function* updateNote(note, noteId) {
    note.mtime = r.now();
    yield r.table('notes').get(noteId).update(note);
}

function* updateNotes(notes) {
    for (let note of notes) {
        note.mtime = r.now();
    }

    yield r.table('notes').insert(notes, {conflict: 'update'});
}

function* deleteNote(noteId) {
    yield r.table('notes').get(noteId).delete();
    yield r.table('note2item').getAll(noteId, {index: 'note_id'}).delete();
}

function* getAllNotesForItem(itemId) {
    return yield r.table('note2item')
        .getAll(itemId, {index: 'item_id'}).without('item_id', 'item_type')
        .eqJoin('note_id', r.table('notes')).without({left: {note_id: true}}).zip();
}

function getAllNotesForItemRQL(itemId) {
    return r.table('note2item')
        .getAll(itemId, {index: 'item_id'}).without('item_id', 'item_type')
        .eqJoin('note_id', r.table('notes')).without({left: {note_id: true}}).zip();
}

function* getNote(noteId) {
    return yield r.table('notes').get(noteId);
}

module.exports = {
    createNote,
    updateNote,
    updateNotes,
    deleteNote,
    getAllNotesForItem,
    getAllNotesForItemRQL,
    getNote,
};