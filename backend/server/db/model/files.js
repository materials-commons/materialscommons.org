/**
 * @fileOverview
 * @name files.js
 * @author V. Glenn Tarcea <glenn.tarcea@gmail.com>
 * @license
 */

module.exports = function(r) {
    'use strict';
    return {
        countInProject: countInProject
    };

    function *countInProject(ids, projectID) {
        let rql = r.table('datafiles').getAll.apply(this, ids);
        let count = yield rql.filter({project_id: projectID}).count();
        return count;
    }
};
