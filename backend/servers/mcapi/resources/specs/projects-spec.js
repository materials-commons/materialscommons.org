// test/spec for backend/servers/mcapi/resources/project.js

'use strict';

require('co-mocha');

var assert = require('assert');

var ropts = {
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815
};

//var r = require('rethinkdbdash')(ropts);
//var projectsModel = require('../../db/model/projects')(r);

// var projects = require('../resources/projects')(projectsModel);

describe.skip('Testing project.js - ', function (){ // does this also need to be function*
    describe('all projects', function () { // does this also need to be function*
        it('for user', function* () {
//            var user='admin@mc.org';
//            var projectList = yield projects._allProjectsForUser(user);
//            assert.isNotNull(projectList, 'is null');
            assert.equal(1,1);
        });
    });

});


