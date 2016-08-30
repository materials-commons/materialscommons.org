// test/spec for backend/servers/mcapi/resources/project.js
'use strict';

let assert = require('chai').assert;
let connection = require('rethinkdbdash')({
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815
});

var projectsModel = require('../../db/model/projects')(connection);
var projects = require('../projects')(projectsModel);

describe('Testing in backend/servers/mcapi/resources/project.js - ', function (){ // does this also need to be function*
    describe('all projects', function () { // does this also need to be function*
        it('for user', function* () {
            var user='admin@mc.org';
            var projectList = yield projects._allProjectsForUser(user);
            assert.isNotNull(projectList, 'is null');
        });
    });

});
