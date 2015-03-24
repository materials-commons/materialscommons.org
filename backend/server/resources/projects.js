module.exports = function(model) {
    'use strict';
    let router = require('koa-router')();
    router.get('/projects', projects);
    return router;

    /////////////////

    function* projects(next) {
        let user = this.mcapp.user;
        this.body = yield model.getProjectsForUser(user.id, user.isadmin);
        yield next;
    }

};
