'use strict';

let rethinkdbdash = require('rethinkdbdash');

let ropts = {
    db: 'mcpub',
    port: process.env.MCDB_PORT || 30815
};

let r = rethinkdbdash(ropts);

module.exports = r;
