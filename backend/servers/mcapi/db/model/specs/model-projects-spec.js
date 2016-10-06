// test/spec for backend/servers/mcapi/db/model/project.js
'use strict';

require('mocha');
require('co-mocha');

let assert = require('chai').assert;
let connection = require('rethinkdbdash')({
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815
});

let projects = require('../projects')(connection);

describe('Test in backend/servers/mcapi/db/model/project.js - ', function () {
    describe('find project - ', function () {
        it("project named 'Test' should exist", function*() {
            let projectsList = yield projects.all();
            let name = "not found";
//            console.log(projectsList);
            for (let project of projectsList) {
                if (project.name == 'Test') {
                    name = project.name;
                }
            }
            console.log("Name is " + name);
            assert.equal(name, "Test", "missing 'Test' project");
        });
    });
});
