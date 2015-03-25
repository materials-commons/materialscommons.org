module.exports = function(model) {
    'use strict';

    let router = require('koa-router')();
    let projects = require('./projects')(model);
    router.get('/projects', projects.all);
    return router;
};
