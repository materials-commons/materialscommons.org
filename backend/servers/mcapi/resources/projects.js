module.exports = function(projects) {
    'use strict';
    const parse = require('co-body');
    return {
        all: all,
        dirTree: dirTree,
        update: update
    };

    /////////////////

    function* all(next) {
        let user = this.reqctx.user;
        this.body = yield projects.forUser(user);
        yield next;
    }

    function* update(next) {
        let attrs = yield parse(this);
        this.body = yield projects.update(this.params.project_id, attrs);
        yield next;
    }

    function* dirTree(next) {
        let dirID = this.params.directory_id || 'top';
        this.body = yield projects.dirTree(this.params.project_id, dirID);
        yield next;
    }

};
