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
        let tree = yield projects.dirTree(this.params.project_id, this.params.directory_id);
        this.body = tree;
        yield next;
    }

};
