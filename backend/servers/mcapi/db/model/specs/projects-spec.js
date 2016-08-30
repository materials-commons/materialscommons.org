// test/spec for backend/servers/mcapi/db/model/project.js

'use strict';

let assert = require('chai').assert;
let connection = require('rethinkdbdash')({
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815
});

let projects = require('../projects')(connection);

describe('Test in backend/servers/mcapi/db/model/project.js - ', function () {
    describe('return all projects: ', function () {
        it("should not be null", function () {
            let projectListDeffered = projects.all();
            projectListDeffered.then(function (theList) {
                let name = "not found";
                assert.isNotNull(theList, "Project list should exist");
            });
        });
    });

    describe('find project - ', function () {
        it("project named 'Test' should exist", function*() {
            let projectsList = yield projects.all();
            let name = "not found";
            for (let project of projectsList) {
                if (project.name == 'Test') {
                    name = project.name;
                }
            }
            assert.equal(name, "Test", "missing 'Test' project");
        });
    });
});
