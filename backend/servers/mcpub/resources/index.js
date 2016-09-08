module.exports = function(model) {
    'use strict';

    const router = require('koa-router')();
    const datasets = require('./datasets')(model.datasets);

    router.get('/datasets/:dataset_id/zipfilelocation', datasets.getZipfileLocation);

    return router;
}