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
    yield * createTable('setupproperties', 'setting_id');
    yield * createTable('process2setupfile', 'process_id', 'datafile_id');
    yield * createTable('properties', 'parent_id');
    yield * createTable('propertyset2property', 'attribute_set_id', 'attribute_id'); // TODO: Review indices
    yield * createTable('measurements', 'process_id');
    yield * createTable('property2measurement', 'attribute_id', 'measurement_id'); // TODO: Review indices
    yield * createTable('process2measurement', 'process_id', 'measurement_id');
    yield * createTable('samples');
    yield * createTable('sample2propertyset', 'sample_id', 'attribute_set_id'); // TODO: Review indices
    yield * createTable('process2sample', 'process_id', 'sample_id', 'attribute_set_id'); // TODO: Review indices
    yield * createTable('project2sample', 'project_id', 'sample_id');
    yield * createTable('best_measure_history', 'process_id', 'attribute_id', 'measurement_id'); // TODO: Review indices
    yield * createTable('process2file'); // TODO: Review indices
    yield * createTable('propertysets');
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
