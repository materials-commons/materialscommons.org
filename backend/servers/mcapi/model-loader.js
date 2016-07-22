var model = null;

module.exports = function modelLoader(isParent) {
    'use strict';

    if (model) {
        return model;
    }

    if (isParent || process.env.MCTEST) {
        model = require('./mocks/model');
    } else {
        let ropts = {
            db: process.env.MCDB || 'materialscommons',
            port: process.env.MCDB_PORT || 30815
        };

        let r = require('rethinkdbdash')(ropts);
        model = require('./db/model')(r);
    }

    return model;
};
