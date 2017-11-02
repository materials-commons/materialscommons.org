const r = require('./../dash');

module.exports.get = function*(next) {
    var rv = yield r.db('materialscommons').table('comments').getAll(this.query.target, {index: 'item_id'});
    if (rv.error) {
        this.status = httpStatus.INTERNAL_SERVER_ERROR;
        this.body = rv;
    } else {
        this.status = 200;
        this.body = {val: rv};
    }
    yield next;
};


