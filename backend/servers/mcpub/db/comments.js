const r = require('./../dash');

module.exports.get = function*(next) {
    var rv = yield  r.db('materialscommons').table('comments')
                    .getAll(this.query.target, {index:'item_id'}).merge((c) => {
                        return {
                            user: r.db('materialscommons').table('users')
                                .get(c('owner')).pluck('fullname')
                            };
                        }
                    )
                    .orderBy(r.desc('birthtime'))
    if (rv.error) {
        this.status = httpStatus.INTERNAL_SERVER_ERROR;
        this.body = rv;
    } else {
        this.status = 200;
        this.body = {val: rv};
    }
    yield next;
};


