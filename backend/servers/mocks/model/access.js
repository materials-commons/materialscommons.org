var promise = require('bluebird');
var accessEntries = require('./data').access;

module.exports = {
    allByProject: allByProject
};

function allByProject() {
    'use strict';

    return promise.resolve().then(function() {
        let byProject = {};
        accessEntries.forEach(function(a) {
            if (!(a.project_id in byProject)) {
                byProject[a.project_id] = [];
            }
            byProject[a.project_id].push(a);
        });
        return byProject;
    });
}
