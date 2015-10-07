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

    return {
        countInProject: countInProject,
        get: get,
        put: put
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
    function* put(fileID, file) {
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
            yield updateNotes(fileID, file.notes);
        }

        let newVal = yield get(fileID);
        return {val: newVal};
    }

    function* validateFileName(fileID, fileName) {
        let rql = r.table('datadir2datafile').getAll(fileID, {index: 'datafile_id'}).
            eqJoin('datadir_id', r.table('datadir2datafile'), {index: 'datadir_id'}).zip().
            eqJoin('datafile_id', r.table('datafiles')).zip().
            filter({name: fileName}).count();
        let matchingNameCount = yield runQuery(rql);
        return matchingNameCount === 0;
    }

    function* updateTags(fileID, tags) {
        let rql = r.table('tag2item').getAll(fileID, {index: 'item_id'});
        let tagsFromDB = yield runQuery(rql);
        let currentTags = [];
        tagsFromDB.forEach(t => currentTags.push(t.tag_id));
        let tagsFlat = [];
        tags.forEach(t => tagsFlat.push(t.tag_id));
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

    function* deleteTags(tagsDeleted, tagsFromDB) {
            let tagsHash = [];
            tagsFromDB.forEach(t => tagsHash[t.tag_id] = t);
            let tagsToDelete = [];
            tagsDeleted.forEach(t => tagsToDelete.push(tagsHash[t].id));
            let rql = r.table('tag2item').getAll(r.args(tagsToDelete)).delete();
            return yield runQuery(rql);
    }

    function* addTags(tagsAdded, fileID) {
        let tagsToAdd = [];
        tagsAdded.forEach(t => tagsToAdd.push({tag_id: t, item_id: fileID, item_type: 'datafile'}));
        let rql = r.table('tag2item').insert(tagsToAdd);
        return yield runQuery(rql);
    }

    function* updateNotes(fileID, notes) {
        return "";
    }
};
