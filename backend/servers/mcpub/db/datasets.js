var r = require('./../dash');
const zipFileUtils = require('../../lib/zipFileUtils');
const Promise = require('bluebird');
const fsa = Promise.promisify(require('fs'));

//var parse = require('co-body');

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
            'processes': r.table('dataset2process').getAll(ds('id'), {index: 'dataset_id'}).map(function(row) {
                return r.table('processes').get(row('process_id'))
            }).coerceTo('array'),
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

module.exports.getZipfile = function*(next) {
    console.lot("Arrived at getZipfile: " + this.params.id);
    let ds = yield r.table('datasets').get(this.params.id);
    let fullPath = zipFileUtils.fullPathAndFilename(ds);
    console.log("Full path = " + fullPath);
    this.body = yield fsa.readFile(fullPath);
    yield next;
}

module.exports.getMockReleases = function*() {
    this.body = [{DOI: "ABC123"}, {DOI: "DEF123"}]
};



