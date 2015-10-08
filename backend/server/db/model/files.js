/**
 * @fileOverview
 * @name files.js
 * @author V. Glenn Tarcea <glenn.tarcea@gmail.com>
 * @license
 */

module.exports = function(r) {
    const runQuery = require('./run');
    const db = require('./db')(r);
    const _ = require('lodash');
    const model = require('./model')(r);

    return {
        countInProject: countInProject,
        get: get,
        put: put,
        deleteFile
    };

    function* countInProject(ids, projectID) {
        let rql = r.table('datafiles').getAll(r.args(ids));
        return yield rql.filter({project_id: projectID}).count();
    }

    // get details on a file
    function* get(file_id) {
        let rql = r.table('datafiles').get(file_id).
            merge(function() {
                return {
                    tags: r.table('tag2item').getAll(file_id, {index: 'item_id'}).
                        orderBy('tag_id').
                        pluck('tag_id').coerceTo('array'),
                    notes: r.table('note2item').getAll(file_id, {index: 'item_id'}).
                        eqJoin('note_id', r.table('notes')).zip().coerceTo('array'),
                    samples: r.table('sample2datafile').getAll(file_id, {index: 'datafile_id'}).
                        eqJoin('sample_id', r.table('samples')).zip().
                        pluck('name', 'id').distinct().
                        coerceTo('array'),
                    processes: r.table('process2file').getAll(file_id, {index: 'datafile_id'}).
                        eqJoin('process_id', r.table('processes')).zip().
                        pluck('name', 'id').distinct().
                        coerceTo('array')
                }
            });
        return runQuery(rql);
    }

    // update file
    function* put(fileID, projectID, user, file) {
        let updateFields = {};

        if (file.name) {
            updateFields.name = file.name;
            let isValid = yield validateFileName(fileID, file.name);
            if (!isValid) {
                return {error: `file with name '${file.name}' already exists`};
            }
        }

        if (file.description) {
            updateFields.description = file.description;
        }

        if (updateFields.name || updateFields.description) {
            yield db.update('datafiles', fileID, updateFields);
        }

        if (file.tags) {
            yield updateTags(fileID, file.tags);
        }

        if (file.notes) {
            yield updateNotes(fileID, projectID, user, file.notes);
        }

        let newVal = yield get(fileID);
        return {val: newVal};
    }

    // validateFileName ensures that the file name doesn't already exist in
    // the given directory. This is used when a file is being renamed.
    function* validateFileName(fileID, fileName) {
        let rql = r.table('datadir2datafile').getAll(fileID, {index: 'datafile_id'}).
            eqJoin('datadir_id', r.table('datadir2datafile'), {index: 'datadir_id'}).zip().
            eqJoin('datafile_id', r.table('datafiles')).zip().
            filter({name: fileName}).count();
        let matchingNameCount = yield runQuery(rql);
        return matchingNameCount === 0;
    }

    // updateTags updates the list of tags associated with a file. It takes a
    // list of tags, compares that to the current tags associated with the
    // file and adds or removes tags as needed.
    function* updateTags(fileID, tags) {
        let rql = r.table('tag2item').getAll(fileID, {index: 'item_id'});
        let tagsFromDB = yield runQuery(rql);
        let currentTags = tagsFromDB.map(t => t.tag_id);
        let tagsFlat = tags.map(t => t.tag_id);
        let tagsDeleted = _.difference(currentTags, tagsFlat);
        let tagsAdded = _.difference(tagsFlat, currentTags);
        if (tagsDeleted.length) {
            yield deleteTags(tagsDeleted, tagsFromDB);
        }

        if (addTags.length) {
            yield addTags(tagsAdded, fileID);
        }
        return true;
    }

    // deleteTags will delete tags associated with a file.
    function* deleteTags(tagsDeleted, tagsFromDB) {
            let tagsHash = [];
            tagsFromDB.forEach(t => tagsHash[t.tag_id] = t);
            let tagsToDelete = tagsDeleted.map(t => tagsHash[t].id);
            let rql = r.table('tag2item').getAll(r.args(tagsToDelete)).delete();
            return yield runQuery(rql);
    }

    // addTags will add tags to a file.
    function* addTags(tagsAdded, fileID) {
        let tagsToAdd = [] = tagsAdded.map(t => new model.Tag2Item(t, fileID, 'datafile'));
        let rql = r.table('tag2item').insert(tagsToAdd);
        return yield runQuery(rql);
    }

    // updateNotes adds, modifies or deletes notes associated with a file. It
    // takes a list of notes and for each note determines if that note is being
    // updated, removed, or created.
    function* updateNotes(fileID, projectID, user, notes) {
        for (let note of notes) {
            if (note.id && note.delete) {
                yield deleteNote(note);
            } else if (note.id) {
                yield updateNote(note);
            } else {
                yield addNote(note, fileID, user, projectID);
            }
        }
        return true;
    }

    // deleteNote deletes a given note.
    function* deleteNote(note) {
        yield r.table('notes').get(note.id).delete();
        return yield r.table('note2item').getAll(note.id, {index: 'note_id'}).delete();
    }

    // updateNote updates a given note. The only fields that can be changed are the title and/or the note field.
    function* updateNote(note) {
        let n = {};
        if (note.title) {
            n.title = note.title;
        }
        if (note.note) {
            n.note = note.note;
        }
        n.mtime = r.now();
        return yield r.table('notes').get(note.id).update(n);
    }

    // addNote adds a new note and associates it with the given file.
    function* addNote(note, fileID, owner, projectID) {
        let n = new model.Note(note.title, note.note, projectID, owner);
        let newNote = yield db.insert('notes', n);
        let note2item = new model.Note2Item(fileID, 'datafile', newNote.id);
        return yield db.insert('note2item', note2item);
    }

    // deleteFile deletes a file if that file is not currently used in any
    // processes or samples. It also removes all the files notes.
    function *deleteFile(fileID) {
        let f = yield get(fileID);

        if (f.samples.length) {
            return {error: 'File used in samples'};
        } else if (f.processes.length) {
            return {error: 'File used in processes'};
        }

        if (f.notes.length) {
            var noteIDs = f.notes.map(n => n.id);
            yield r.table('notes').getAll(r.args(noteIDs)).delete();
            yield r.table('note2item').getAll(r.args(noteIDs), {index: 'note_id'}).delete();
        }

        yield r.table('datafiles').get(fileID).delete();
        yield r.table('project2datafile').getAll(fileID, {index: 'datafile_id'}).delete();
        yield r.table('datadir2datafile').getAll(fileID, {index: 'datafile_id'}).delete();
        return {val: f};
    }
};
