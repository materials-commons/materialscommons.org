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

    console.log("Creating mctest database.");
    console.log("=======================");
    yield r.dbCreate('mctest');
    yield * createTable('processes', 'template_id');
    yield * createTable('project2process', 'project_id', 'process_id');
    yield * createTable('setups');
    yield * createTable('process2setup', 'process_id', 'setup_id');
    yield * createTable('measurements', 'process_id');
    yield * createTable('measure2datafile', 'measurement_id', 'datafile_id');
    yield * createTable('process2measurement', 'process_id', 'measurement_id');
    yield * createTable('setupproperties', 'setting_id');
    yield * createTable('attributes', 'parent_id');
    yield * createTable('attribute2measurement', 'attribute_id', 'measurement_id');
    yield * createTable('attributeset2attribute', 'attribute_set_id', 'attribute_id');
    yield * createTable('attribute2process', 'attribute_id', 'process_id');
    yield * createTable('samples');
    yield * createTable('sample2file', 'sample_id', 'datafile_id');
    yield * createTable('attributeset', 'parent_id');
    yield * createTable('sample2attributeset', 'sample_id', 'attribute_set_id');
    yield * createTable('process2sample', 'process_id', 'sample_id', 'attribute_set_id');
    yield * createTable('project2sample', 'project_id', 'sample_id');
    yield * createTable('best_measure_history', 'process_id', 'attribute_id', 'measurement_id');
    yield * createTable('process2setupfile', 'process_id', 'datafile_id');
    yield * createTable('process2output', 'process_id', 'datafile_id');
    yield * createTable('process2input', 'process_id', 'datafile_id');
    yield r.getPool().drain();

    /////////////////////////////

    function *createTable(table) {
        console.log('  create table...', table);
        yield r.tableCreate(table);
        if (arguments.length > 1) {
            for (let i = 1; i < arguments.length; i++) {
                console.log('     create index', arguments[i]);
                yield r.table(table).indexCreate(arguments[i]);
            }
        }
    }
})();
