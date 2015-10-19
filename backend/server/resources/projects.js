module.exports = function(projects) {
    'use strict';
    return {
        all: all,
        dirTree: dirTree
    };

    /////////////////

    function* all(next) {
        let user = this.reqctx.user;
        this.body = yield projects.forUser(user);
        yield next;
    }

    function* dirTree(next) {
        let dirID = this.params.directory_id || 'top';
        let tree = yield projects.dirTree(this.params.project_id, dirID);
        this.body = tree;
        yield next;
    }

};
