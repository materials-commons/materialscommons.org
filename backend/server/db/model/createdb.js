#!/usr/bin/env node

var promise = require('bluebird');

promise.coroutine(function *() {
    'use strict';

    let ropts = {
        db: 'mctest',
        port: 30815
    };

    let r = require('rethinkdbdash')(ropts);

    try {
        yield r.dbDrop('mctest');
    } catch (err) {
        console.log(err);
    }

    console.log("Creating test database.");
    console.log("=======================");
    yield r.dbCreate('mctest');
    yield * createTable('processes', 'template_id');
    yield * createTable('project2process', 'project_id', 'process_id');
    yield * createTable('settings');
    yield * createTable('process2settings', 'process_id', 'setting_id');
    yield * createTable('measurements', 'process_id');
    yield * createTable('process2measurement', 'process_id', 'measurement_id');
    yield * createTable('measurement2datafile', 'measurement_id', 'datafile_id');
    yield r.getPool().drain();

    /////////////////////////////

    function *createTable(table) {
        console.log('create table', table);
        yield r.tableCreate(table);
        if (arguments.length > 1) {
            for (let i = 1; i < arguments.length; i++) {
                console.log('   create index', arguments[i]);
                yield r.table(table).indexCreate(arguments[i]);
            }
        }
    }
})();
