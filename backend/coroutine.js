#!/usr/bin/env node

let ropts = {
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815
}

let r = require('rethinkdbdash')(ropts);
let bluebird = require('bluebird');
const comments = require('./servers/mcapi/db/model/comments.js');

function* getProjects() {
	console.log("x");
	let ret = yield * comments.get('5608502b-b519-4f1a-9a4e-ee83aff37d71');
	console.log("xx");
    return ret;
}

function* doit() {
    console.log('calling getProjects', comments);
    let mine = yield * getProjects();
    console.log('past getProjects');
    console.log(mine);
}

bluebird.coroutine(doit)().then(() => process.exit(0));
