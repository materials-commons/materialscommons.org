module.exports = function modelLoader(isParent) {
    'use strict';

    if (isParent) {
        return require('./mocks/model');
    }

    let ropts = {
        db: 'materialscommons',
        port: 30815
    };

    let r = require('rethinkdbdash')(ropts);
    return require('./db/model')(r);
};
