/**
 * @fileOverview
 * @name files.js
 * @author V. Glenn Tarcea <glenn.tarcea@gmail.com>
 * @license
 */

module.exports = function(r) {
    const runQuery = require('./run');
    const db = require('./db')(r);

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
                        pluck('tag').coerceTo('array'),
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
    function* put(file_id, file) {
        let updateFields = {};

        if (file.name) {
            updateFields.name = file.name;
            let isValid = yield validateFileName(file_id, file.name);
            if (!isValid) {
                return {error: `file with name '${file.name}' already exists`};
            }
        }

        if (file.description) {
            updateFields.description = file.description;
        }

        let newVal = yield db.update('datafiles', file_id, updateFields);
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
};
