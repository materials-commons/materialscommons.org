module.exports = function(projects) {
    'use strict';
    return {
        all: all
    };

    /////////////////

    function* all(next) {
        let user = this.reqctx.user;
        this.body = yield projects.forUser(user);
        yield next;
    }

};
