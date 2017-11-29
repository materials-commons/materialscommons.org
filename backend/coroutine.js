#!/usr/bin/env node

let ropts = {
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815
}

// let r = require('rethinkdbdash')(ropts);
let r = require('thinky')(ropts).r;

let bluebird = require('bluebird');
const comments = require('./servers/mcapi/db/model/comments.js');

function* getComment() {
    console.log()
	let ret = yield * comments.get('6b19b75d-954b-444e-9f01-c6d6e584de96');
    return ret;
}

function* doit() {
    console.log('calling getComment', comments);
    let mine = yield * getComment();
    console.log('past getComment');
    console.log(mine);
}

bluebird.coroutine(doit)().then(() => process.exit(0));
