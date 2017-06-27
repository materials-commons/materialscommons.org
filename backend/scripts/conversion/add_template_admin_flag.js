#!/usr/bin/env node

"use strict";

var ropts = {
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815
};

console.log(ropts);
var r = require('rethinkdbdash')(ropts);
var bluebird = require('bluebird');

bluebird.coroutine(function*() {
    try {
        var results = yield r.db("materialscommons").table('users').update({'isTemplateAdmin' : False});
    }
}