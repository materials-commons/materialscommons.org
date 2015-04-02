module.exports = function(r) {
    'use strict';

    let run = require('./run');
    let getSingle = require('./get-single');
    return {
        create: create,
        forUser: forUser,
        get: function(id, index) {
            return getSingle(r, 'samples', id, index);
        },
        findInProject: findInProject
    };

    /////////////////

    function forUser(user) {
        let rql;

        return run(rql);
    }

    function create(user, project, sample) {
        let rql;

        return run(rql);
    }

    function findInProject(projectID, index, key) {
        let filterTerm = {};
        filterTerm[index] = key;
        let rql = r.table('project2sample')
                .getAll(projectID, {index: 'project_id'})
                .eqJoin('sample_id', r.table('samples'))
                .zip()
                .filter(filterTerm);
        return run(rql);
    }
};
