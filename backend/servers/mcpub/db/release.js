var r = require('./../dash');
//var parse = require('co-body');

module.exports.getAll = function*(next) {
    this.body = yield r.table('datasets').merge(function(rel) {
        return {
            'files': r.table('datafiles').getAll(r.args(rel('datafiles'))).coerceTo('array'),
            'appreciations': r.table('appreciations').getAll(rel('id'), {index: 'dataset_id'}).count(),
            'views': r.table('views').getAll(rel('id'), {index: 'dataset_id'}).count()
        }
    });
    yield next;
};

module.exports.getAllCount = function*(next) {
    this.body = yield r.table('datasets').count();
    yield next;
};

module.exports.getRecent = function*(next) {
    this.body = yield r.table('datasets').orderBy(r.desc('birthtime')).merge(function(rel) {
        return {
            'files': r.table('datafiles').getAll(r.args(rel('datafiles'))).coerceTo('array')
        }
    }).limit(10);
    yield next;
};

module.exports.getTopViews = function*(next) {
    this.body = yield r.table('datasets').merge(function(rel) {
        return {
            'files': r.table('datafiles').getAll(r.args(rel('datafiles'))).coerceTo('array'),
            'appreciations': r.table('appreciations').getAll(rel('id'), {index: 'dataset_id'}).count(),
            'views': r.table('views').getAll(rel('id'), {index: 'dataset_id'}).count()
        }
    }).orderBy(r.desc('views')).limit(10);
    yield next;
};

module.exports.getOne = function*(next) {
    this.body = yield r.table('datasets').get(this.params.id).merge(function(rel) {
        return {
            'files': r.table('datafiles').getAll(r.args(rel('datafiles'))).coerceTo('array'),
            'other_datasets': r.table('datasets').getAll(rel('author'), {index: "author"}).merge(function(od) {
                return {
                    'files': r.table('datafiles').getAll(r.args(od('datafiles'))).coerceTo('array')
                }
            }).coerceTo('array'),
            'tags': r.table('tags2datasets').getAll(rel('id'), {index: "dataset_id"}).map(function(row) {
                return r.table('tags').get(row('tag'));
            }).coerceTo('array'),
            'processes': r.table('datasets2processes').getAll(rel('id'), {index: 'dataset_id'}).map(function(row) {
                return r.table('processes').get(row('process_id'))
            }).coerceTo('array'),
            'samples': r.table('datasets2samples').getAll(rel('id'), {index: 'dataset_id'}).map(function(row) {
                return r.table('samples').get(row('sample_id'))
            }).coerceTo('array')
        }
    });
    if (this.params.user_id) {
        var is_appreciated = yield r.table('appreciations').getAll([this.params.user_id, this.params.id], {index: 'user_dataset'}).coerceTo('array');
        if (is_appreciated.length > 0) {
            this.body.appreciate = true;
        }
    }
    yield next;
};

module.exports.getMockReleases = function*() {
    this.body = [{DOI: "ABC123"}, {DOI: "DEF123"}]
};


