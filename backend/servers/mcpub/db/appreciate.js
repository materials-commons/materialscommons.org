var r = require('./../dash');
var parse = require('co-body');

module.exports.addAppreciate = function*(next) {
    var params = yield parse(this);
    var inserted = yield r.table('appreciations').insert(params);
    this.status = 200;
    this.body = inserted;
    yield next;
};

module.exports.removeAppreciation = function*(next) {
    var params = yield parse(this);
    var deleted = yield r.table('appreciations').getAll([params.user_id, params.dataset_id], {index: 'user_dataset'}).delete();
    this.status = 200;
    this.body = deleted;
    yield next;
};
