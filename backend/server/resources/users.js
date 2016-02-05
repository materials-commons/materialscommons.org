module.exports = function(users) {
    const parse = require('co-body');

    return {
        update: update
    };

    function* update(next) {
        let attrs = yield parse(this);
        this.body = yield users.update(this.reqctx.user.id, this.params.project_id, attrs);
        this.status = 200;
        yield next;
    }
};
