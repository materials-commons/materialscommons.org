var r = require('./../dash');
var parse = require('co-body');

module.exports.getProcessTypes = function*(next) {
    this.body = yield r.table('processes').group('type').merge(function(row) {
        return {
            datasets: r.table('datasets2processes').getAll(row('id'), {index: 'process_id'}).coerceTo('array').map(function(val) {
                return r.table('datasets').get(val('dataset_id'))
            })
        }
    });
    yield next;
};

module.exports.getSamples = function*(next) {
    this.body = yield r.table('samples').merge(function(row) {
        return {
            datasets: r.table('datasets2samples').getAll(row('id'), {index: 'sample_id'}).coerceTo('array').map(function(val) {
                return r.table('datasets').get(val('dataset_id'))
            }),
            dataset_count: r.table('datasets2samples').getAll(row('id'), {index: 'sample_id'}).coerceTo('array').map(function(val) {
                return r.table('datasets').get(val('dataset_id'))
            }).count()
        }
    });
    yield next;
};

module.exports.getAuthors = function*(next) {
    this.body = yield r.table('users').pluck('email', 'firstName', 'lastName', 'instituition', 'department', 'image').merge(function(user) {
        return {
            datasets: r.table('datasets2users').getAll(user('email'), {index: 'user_id'}).map(function(val) {
                return r.table('datasets').get(val('dataset_id'))
            }).coerceTo('array'),
            tags: r.table('tags').getAll(user('email'), {index: 'user_id'}).pluck('id').orderBy('id').coerceTo('array')
        }
    });
    yield next;
};

module.exports.getAllAuthorsCount = function*(next) {
    this.body = yield r.table('users').count();
    yield next;
};
