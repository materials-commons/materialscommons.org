const r = require('./../dash');
const commonQueries = require('../../lib/common-queries');

module.exports.getAll = function*(next) {
    this.body = yield r.db('materialscommons').table('datasets').filter({published: true}).merge(function(ds) {
        return {
            'files': r.table('dataset2datafile').getAll(ds('id'), {index: 'dataset_id'})
                .eqJoin('datafile_id', r.table('datafiles')).zip().coerceTo('array'),
            'appreciations': r.table('appreciations').getAll(ds('id'), {index: 'dataset_id'}).count(),
            'views': r.table('views').getAll(ds('id'), {index: 'dataset_id'}).count()
        }
    });
    yield next;
};

module.exports.getAllCount = function*(next) {
    this.body = yield r.db('materialscommons').table('datasets').filter({published: true}).count();
    yield next;
};

module.exports.getRecent = function*(next) {
    this.body = yield r.db('materialscommons').table('datasets').filter({published: true})
        .orderBy(r.desc('birthtime')).merge(function(ds) {
            return {
                'files': r.table('dataset2datafile').getAll(ds('id'), {index: 'dataset_id'})
                    .eqJoin('datafile_id', r.table('datafiles')).zip().coerceTo('array'),
            }
        }).limit(10);
    yield next;
};

module.exports.getTopViews = function*(next) {
    this.body = yield r.db('materialscommons').table('datasets').filter({published: true}).merge(function(ds) {
        return {
            'files': r.table('dataset2datafile').getAll(ds('id'), {index: 'dataset_id'})
                .eqJoin('datafile_id', r.table('datafiles')).zip().coerceTo('array'),
            'appreciations': r.table('appreciations').getAll(ds('id'), {index: 'dataset_id'}).count(),
            'views': r.table('views').getAll(ds('id'), {index: 'dataset_id'}).count()
        }
    }).orderBy(r.desc('views')).limit(10);
    yield next;
};

module.exports.getOne = function*(next) {
    let processesRql = commonQueries.processDetailsRql(r.table('dataset2process')
        .getAll(this.params.id, {index: 'dataset_id'})
        .eqJoin('process_id', r.table('processes')).zip(), r)
    this.body = yield r.db('materialscommons').table('datasets').get(this.params.id).merge(function(ds) {
        return {
            'files': r.table('dataset2datafile').getAll(ds('id'), {index: 'dataset_id'})
                .eqJoin('datafile_id', r.table('datafiles')).zip().coerceTo('array'),
            'other_datasets': r.db('materialscommons').table('datasets').getAll(ds('owner'), {index: "owner"})
                .filter({published: true}).merge(function(od) {
                return {
                    'files': r.table('dataset2datafile').getAll(od('id'), {index: 'dataset_id'})
                        .eqJoin('datafile_id', r.table('datafiles')).zip().coerceTo('array')
                }
            }).coerceTo('array'),
            'tags': r.table('tag2dataset').getAll(ds('id'), {index: "dataset_id"}).map(function(row) {
                return r.table('tags').get(row('tag'));
            }).coerceTo('array'),
            processes: processesRql.coerceTo('array'),
            'samples': r.table('dataset2sample').getAll(ds('id'), {index: 'dataset_id'}).map(function(row) {
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


