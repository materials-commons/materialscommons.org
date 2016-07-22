var r = require('./../dash');

module.exports.getAll = function*(next) {
    this.body = yield {
        appreciations: r.table('appreciations').getAll(this.params.dataset_id, {index: 'dataset_id'}).count(),
        views: r.table('views').getAll(this.params.dataset_id, {index: 'dataset_id'}).count(),
        comments: r.table('comments').getAll(this.params.dataset_id, {index: 'dataset_id'}).orderBy('birthtime').eqJoin('user_id', r.table('users')).zip().coerceTo('array'),
        downloads: []
    };
    yield next;
};
