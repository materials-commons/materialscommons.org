/**
 * @fileOverview
 * @name files.js
 * @author V. Glenn Tarcea <glenn.tarcea@gmail.com>
 * @license
 */

module.exports = function(r) {
    const runQuery = require('./run');

    return {
        countInProject: countInProject,
        get: get
    };

    function* countInProject(ids, projectID) {
        let rql = r.table('datafiles').getAll(r.args(ids));
        let count = yield rql.filter({project_id: projectID}).count();
        return count;
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
};
