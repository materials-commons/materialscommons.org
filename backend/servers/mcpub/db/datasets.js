const r = require('./../dash');
const commonQueries = require('../../lib/common-queries');
const zipFileUtils = require('../../lib/zipFileUtils');
const fs = require('fs');
const processCommon = require('../../mcapi/db/model/process-common');

const doiUrl = process.env.MC_DOI_SERVICE_URL || 'https://ezid.lib.purdue.edu/';

module.exports.getAll = function* (next) {
    this.body = yield getAllDatasets();
    yield next;
};

// deprecated
module.exports.getRecent = function* (next) {
    this.body = yield getAllDatasets();
    yield next;
};

// deprecated
module.exports.getTopViews = function* (next) {
    this.body = yield getAllDatasets();
    yield next;
};

module.exports.getDatasetProcess = function* (next) {
    let rv = yield processCommon.getProcess(r, this.params.process_id);
    this.body = rv.val;
    yield next;
};

module.exports.getAllCount = function* (next) {
    let count = yield r.db('materialscommons').table('datasets').filter({published: true}).count();
    this.body = {count: count};
    yield next;
};

module.exports.getOne = function* (next) {
    let processesRql = commonQueries.processDetailsRql(r.table('dataset2process')
        .getAll(this.params.id, {index: 'dataset_id'})
        .eqJoin('process_id', r.table('processes')).zip(), r);
    this.body = yield r.db('materialscommons').table('datasets').get(this.params.id).merge(function (ds) {
        return {
            files: r.table('dataset2datafile').getAll(ds('id'), {index: 'dataset_id'})
                .eqJoin('datafile_id', r.table('datafiles')).zip().coerceTo('array'),
            other_datasets: r.db('materialscommons').table('datasets').getAll(ds('owner'), {index: "owner"})
                .filter({published: true}).merge(function (od) {
                    return {
                        'files': r.table('dataset2datafile').getAll(od('id'), {index: 'dataset_id'})
                            .eqJoin('datafile_id', r.table('datafiles')).zip().coerceTo('array')
                    }
                }).coerceTo('array'),
            tags: r.table('tag2dataset').getAll(ds('id'), {index: "dataset_id"}).map(function (row) {
                return r.table('tags').get(row('tag'));
            }).coerceTo('array'),
            processes: processesRql.coerceTo('array'),
            samples: r.table('dataset2sample').getAll(ds('id'), {index: 'dataset_id'}).map(function (row) {
                return r.table('samples').get(row('sample_id'))
            }).coerceTo('array'),
            publisher: (!ds('owner')) ?
                {id: null, fullname: 'unknown'} :
                r.db('materialscommons').table('users').get(ds('owner')).pluck(['id', 'fullname']),
            stats: {
                unique_view_count: {
                    total: r.table('view2item').getAll(ds('id'), {index: 'item_id'}).count()
                    // also, eventually, 'anonymous': items with user_ids that are not users
                    //   and 'authenticated': items with user_ids that are users
                },
                comment_count: r.db('materialscommons').table('comments')
                    .getAll(ds('id'), {index: 'item_id'}).count(),
                interested_users: r.table('useful2item').getAll(ds('id'),{index: 'item_id'})
                    .eqJoin('user_id', r.db('materialscommons')
                        .table('users'))
                    .zip().pluck('fullname', 'email')
                    .coerceTo('array')
                //, 'download_count': 0    // this is on main body of dataset, for now, see client-side logic
            }
        };
    });
    if (this.body.doi) {
        this.body.doi_url = doiUrlLink(this.body.doi);
    }
    yield next;
};

module.exports.getZipfile = function* (next) {
    let ds = yield r.db('materialscommons').table('datasets').get(this.params.id);
    yield r.db('materialscommons').table('datasets').get(this.params.id)
        .update({download_count: r.row("download_count").add(1).default(1)});
    let fullPath = zipFileUtils.fullPathAndFilename(ds);
    this.body = fs.createReadStream(fullPath, {highWaterMark: 64 * 1024});
    yield next;
};

module.exports.getMockReleases = function* () {
    this.body = [{DOI: "ABC123"}, {DOI: "DEF123"}]
};

function* getAllDatasets() {
    return yield r.db('materialscommons').table('datasets').filter({published: true}).merge(function (ds) {
        return {
            file_count: r.table('dataset2datafile').getAll(ds('id'), {index: 'dataset_id'}).count(),
            stats: {
                unique_view_count: {
                    total: r.table('view2item').getAll(ds('id'), {index: 'item_id'}).count()
                    // also, eventually, 'anonymous': items with user_ids that are not users
                    //   and 'authenticated': items with user_ids that are users
                },
                comment_count: r.db('materialscommons').table('comments').getAll(ds('id'), {index: 'item_id'}).count(),
                interested_users: r.table('useful2item').getAll(ds('id'), {index: 'item_id'}).pluck('user_id').coerceTo('array')
                //, 'download_count': 0    // this is on main body of dataset, for now, see client-side logic
            }
        }
    });
}

function doiUrlLink(doi) {
    if (!doi) {
        return "";
    }
    return `${doiUrl}id/${doi}`;
}
