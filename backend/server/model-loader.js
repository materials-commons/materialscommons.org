module.exports = function modelLoader(isParent) {
    'use strict';

    if (isParent || process.env.MCTEST) {
        return require('./mocks/model');
    }

    let ropts = {
        db: process.env.MCDB || 'materialscommons',
        port: process.env.MCPORT || 30815
    };

    let r = require('rethinkdbdash')(ropts);
    return require('./db/model')(r);
};
