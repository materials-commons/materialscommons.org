module.exports = function(users) {
    const parse = require('co-body');

    return {
        update: update
    };

    function* update(next) {
        let attrs = yield parse(this);
        this.body = yield users.update(this.reqctx.user.id, attrs);
        this.status = 200;
        yield next;
    }
};
