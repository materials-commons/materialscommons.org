module.exports = function(r) {
    'use strict';

    let run = require('./run');
    let getSingle = require('./get-single');
    return {
        update: update,
        forUser: forUser,
        get: function(id, index) {
            return getSingle(r, 'samples', id, index);
        },
        findInProject: findInProject,
        countAttributesInSample: countAttributesInSample
    };

    /////////////////

    function forUser(user) {
        let rql;

        return run(rql);
    }

    function update(sample) {
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

    function *countAttributesInSample(asetID, attrIDs) {
        attrIDs.push({index: 'attribute_id'});
        let rql = r.table('attributeset2attribute').getAll.apply(this, attrIDs);
        let count = yield rql.filter({attribute_set_id: asetID}).count();
        return count;
    }

};
