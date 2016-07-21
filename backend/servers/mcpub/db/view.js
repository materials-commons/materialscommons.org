var r = require('./../dash');
var parse = require('co-body');

module.exports.addView = function*(next) {
    var params = yield parse(this);
    var inserted = yield r.table('views').insert(params);
    this.status = 200;
    this.body = inserted;
    yield next;
};
