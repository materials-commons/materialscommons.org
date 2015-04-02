var model = null;

module.exports = function modelLoader(isParent) {
    'use strict';

    if (isParent || process.env.MCTEST) {
        return require('./mocks/model');
    }

    if (!model) {
        let ropts = {
            db: process.env.MCDB || 'materialscommons',
            port: process.env.MCPORT || 30815
        };

        let r = require('rethinkdbdash')(ropts);
        model = require('./db/model')(r);
    }

    return model;
};
