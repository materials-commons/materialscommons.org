const r = require('../r');
const commonQueries = require('../queries/common-queries');
const zipFileUtils = require('../util/zipFileUtils');
const fs = require('fs');
const processCommon = require('./process-common');

const doiUrl = process.env.MC_DOI_SERVICE_URL || 'https://ezid.lib.purdue.edu/';

module.exports.getAll = async function () {
    return await getAllDatasets();
};

// deprecated
module.exports.getRecent = async function () {
    return await getAllDatasets();
};

// deprecated
module.exports.getTopViews = async function () {
    return await getAllDatasets();
};

module.exports.getDatasetProcess = async function (processId) {
    return await processCommon.getProcess(r, processId);
};

module.exports.getAllCount = async function () {
    return await r.table('datasets').filter({published: true}).count();
};

module.exports.getOne = async function (next) {
    let processesRql = commonQueries.processDetailsRql(r.db('mcpub').table('dataset2process')
        .getAll(this.params.id, {index: 'dataset_id'})
        .eqJoin('process_id', r.db('mcpub').table('processes')).zip(), r);
    let ds = await r.table('datasets').get(this.params.id).merge(function (ds) {
        return {
            files: r.db('mcpub').table('dataset2datafile').getAll(ds('id'), {index: 'dataset_id'})
                .eqJoin('datafile_id', r.db('mcpub').table('datafiles')).zip().coerceTo('array'),
            other_datasets: r.table('datasets').getAll(ds('owner'), {index: "owner"})
                .filter({published: true}).merge(function (od) {
                    return {
                        'files': r.db('mcpub').table('dataset2datafile').getAll(od('id'), {index: 'dataset_id'})
                            .eqJoin('datafile_id', r.db('mcpub').table('datafiles')).zip().coerceTo('array')
                    }
                }).coerceTo('array'),
            tags: r.db('mcpub').table('tag2dataset').getAll(ds('id'), {index: "dataset_id"}).map(function (row) {
                return r.db('mcpub').table('tags').get(row('tag'));
            }).coerceTo('array'),
            processes: processesRql.coerceTo('array'),
            samples: r.db('mcpub').table('dataset2sample').getAll(ds('id'), {index: 'dataset_id'}).map(function (row) {
                return r.db('mcpub').table('samples').get(row('sample_id'))
            }).coerceTo('array'),
            publisher: (!ds('owner')) ?
                {id: null, fullname: 'unknown'} :
                r.table('users').get(ds('owner')).pluck(['id', 'fullname']),
            stats: {
                unique_view_count: {
                    total: r.db('mcpub').table('view2item').getAll(ds('id'), {index: 'item_id'}).count()
                    // also, eventually, 'anonymous': items with user_ids that are not users
                    //   and 'authenticated': items with user_ids that are users
                },
                comment_count: r.table('comments')
                    .getAll(ds('id'), {index: 'item_id'}).count(),
                interested_users: r.db('mcpub').table('useful2item').getAll(ds('id'), {index: 'item_id'})
                    .eqJoin('user_id', r.table('users'))
                    .zip().pluck('fullname', 'email')
                    .coerceTo('array')
                //, 'download_count': 0    // this is on main body of dataset, for now, see client-side logic
            }
        };
    });
    if (ds.doi) {
        ds.doi_url = doiUrlLink(ds.doi);
    }
    return ds;
};

module.exports.getZipfile = async function (next) {
    let ds = await r.db('mcpub').table('datasets').get(this.params.id);
    await r.db('mcpub').table('datasets').get(this.params.id)
        .update({download_count: r.row("download_count").add(1).default(1)});
    let fullPath = zipFileUtils.fullPathAndFilename(ds);
    return fs.createReadStream(fullPath, {highWaterMark: 64 * 1024});
};

module.exports.getMockReleases = async function () {
    this.body = [{DOI: "ABC123"}, {DOI: "DEF123"}]
};

async function getAllDatasets() {
    return await r.table('datasets').filter({published: true}).merge(function (ds) {
        return {
            file_count: r.db('mcpub').table('dataset2datafile').getAll(ds('id'), {index: 'dataset_id'}).count(),
            stats: {
                unique_view_count: {
                    total: r.db('mcpub').table('view2item').getAll(ds('id'), {index: 'item_id'}).count()
                    // also, eventually, 'anonymous': items with user_ids that are not users
                    //   and 'authenticated': items with user_ids that are users
                },
                comment_count: r.table('comments').getAll(ds('id'), {index: 'item_id'}).count(),
                interested_users: r.db('mcpub').table('useful2item').getAll(ds('id'), {index: 'item_id'}).pluck('user_id').coerceTo('array')
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
