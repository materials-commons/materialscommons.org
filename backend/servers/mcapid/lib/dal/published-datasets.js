const r = require('../../../shared/r');
const run = require('./run');
const commonQueries = require('../../../lib/common-queries');
const processCommon = require('../common/process-common');

const getDataset = async(datasetId) => {
    let processesRql = commonQueries.processDetailsRql(r.db('mcpub').table('dataset2process')
        .getAll(datasetId, {index: 'dataset_id'})
        .eqJoin('process_id', r.db('mcpub').table('processes')).zip(), r.db('mcpub'));
    let dataset = await r.db('materialscommons').table('datasets').get(datasetId).merge(function(ds) {
        return {
            files: r.db('mcpub').table('dataset2datafile').getAll(ds('id'), {index: 'dataset_id'})
                .eqJoin('datafile_id', r.db('mcpub').table('datafiles')).zip().coerceTo('array'),
            other_datasets: r.db('materialscommons').table('datasets').getAll(ds('owner'), {index: 'owner'})
                .filter({published: true}).merge(function(od) {
                    return {
                        'files': r.db('mcpub').table('dataset2datafile').getAll(od('id'), {index: 'dataset_id'})
                            .eqJoin('datafile_id', r.db('mcpub').table('datafiles')).zip().coerceTo('array')
                    };
                }).coerceTo('array'),
            tags: r.db('mcpub').table('tag2dataset').getAll(ds('id'), {index: 'dataset_id'})
                .map(function(row) {
                    return r.db('mcpub').table('tags').get(row('tag'));
                }).coerceTo('array'),
            processes: processesRql.coerceTo('array'),
            samples: r.db('mcpub').table('dataset2sample').getAll(ds('id'), {index: 'dataset_id'})
                .map(function(row) {
                    return r.db('mcpub').table('samples').get(row('sample_id'));
                }).coerceTo('array'),
            publisher: (!ds('owner')) ?
                {id: null, fullname: 'unknown'} :
                r.db('materialscommons').table('users').get(ds('owner')).pluck(['id', 'fullname']),
            stats: {
                unique_view_count: {
                    total: r.db('mcpub').table('view2item').getAll(ds('id'), {index: 'item_id'}).count()
                    // also, eventually, 'anonymous': items with user_ids that are not users
                    //   and 'authenticated': items with user_ids that are users
                },
                comment_count: r.db('materialscommons').table('comments')
                    .getAll(ds('id'), {index: 'item_id'}).count(),
                interested_users: r.db('mcpub').table('useful2item').getAll(ds('id'), {index: 'item_id'})
                    .eqJoin('user_id', r.db('materialscommons').table('users'))
                    .zip().pluck('fullname', 'email').coerceTo('array')
                //, 'download_count': 0    // this is on main body of dataset, for now, see client-side logic
            }
        };
    });

    if (dataset.doi) {
        dataset.doi_url = doiUrlLink(dataset.doi);
    }

    return dataset;
};

const doiUrl = process.env.MC_DOI_SERVICE_URL || 'https://ezid.lib.purdue.edu/';

function doiUrlLink(doi) {
    if (!doi) {
        return '';
    }
    return `${doiUrl}id/${doi}`;
}

const getTopViewedDatasets = async() => {
    return await getAllDatasets();
};

const getRecentlyPublishedDatasets = async() => {
    return await getAllDatasets();
};

const getAllDatasets = async() => {
    return await r.db('materialscommons').table('datasets').filter({published: true}).merge(function(ds) {
        return {
            file_count: r.db('mcpub').table('dataset2datafile').getAll(ds('id'), {index: 'dataset_id'}).count(),
            stats: {
                unique_view_count: {
                    total: r.db('mcpub').table('view2item').getAll(ds('id'), {index: 'item_id'}).count()
                    // also, eventually, 'anonymous': items with user_ids that are not users
                    //   and 'authenticated': items with user_ids that are users
                },
                comment_count: r.db('materialscommons').table('comments').getAll(ds('id'), {index: 'item_id'}).count(),
                interested_users: r.db('mcpub').table('useful2item').getAll(ds('id'), {index: 'item_id'}).pluck('user_id').coerceTo('array')
                //, 'download_count': 0    // this is on main body of dataset, for now, see client-side logic
            }
        };
    });
};

const getDatasetsForTag = async(tagId) => {
    return await r.db('mcpub').table('tag2dataset').getAll(tagId, {index: 'tag'})
        .eqJoin('dataset_id', r.db('materialscommons').table('datasets')).zip()
        .merge(function(ds) {
            return {
                file_count: r.db('mcpub').table('dataset2datafile').getAll(ds('id'), {index: 'dataset_id'}).count(),
                stats: {
                    unique_view_count: {
                        total: r.db('mcpub').table('view2item').getAll(ds('id'), {index: 'item_id'}).count()
                        // also, eventually, 'anonymous': items with user_ids that are not users
                        //   and 'authenticated': items with user_ids that are users
                    },
                    comment_count: r.db('materialscommons').table('comments').getAll(ds('id'), {index: 'item_id'}).count(),
                    interested_users: r.db('mcpub').table('useful2item').getAll(ds('id'), {index: 'item_id'}).pluck('user_id').coerceTo('array')
                }
            };
        });
};

const getProcessForDataset = async(datasetId, processId) => {
    let processRql = r.db('mcpub').table('dataset2process').getAll([datasetId, processId], {index: 'dataset_process'})
        .eqJoin('process_id', r.db('mcpub').table('processes')).zip();
    let rql = commonQueries.processDetailsRql(processRql, r.db('mcpub'));
    let process = await run(rql);
    let template = await r.table('templates').get(`global_${process[0].template_name}`);
    process = processCommon.mergeTemplateIntoProcess(template, process[0]);
    return processCommon.convertDatePropertyAttributes(process);
};

const getCommentsForDataset = async(datasetId) => {
    return await r.table('comments').getAll(datasetId, {index: 'item_id'})
        .merge((comment) => {
                return {
                    user: r.table('users').get(comment('owner')).pluck('fullname')
                };
            }
        ).orderBy(r.desc('birthtime'));
};

function View(user_id, item_type, item_id) {
    this.user_id = user_id;
    this.item_type = item_type;
    this.item_id = item_id;
    this.birthtime = r.now();
    this.mtime = this.birthtime;
    this.otype = 'view';
    this.count = 1;
}

const incrementViewForDataset = async(datasetId, userId) => {
    let views = await r.db('mcpub').table('view2item').getAll([userId, datasetId], {index: 'user_item'});
    let view;
    if (views.length) {
        // Already an existing view
        let count = views[0].count + 1;
        let result = await r.db('mcpub').table('view2item').get(views[0].id).update({count: count}, {returnChanges: 'always'});
        view = result.changes[0].new_val;
    } else {
        // New view, so create it
        let createView = new View(userId, 'dataset', datasetId);
        let result = await r.db('mcpub').table('view2item').insert(createView, {returnChanges: 'always'});
        view = result.changes[0].new_val;
    }
    return view;
};

function Useful(user_id, item_type, item_id) {
    this.user_id = user_id;
    this.item_type = item_type;
    this.item_id = item_id;
    this.birthtime = r.now();
    this.mtime = this.birthtime;
    this.otype = 'useful';
}

const markDatasetAsUseful = async(datasetId, userId) => {
    let create = new Useful(userId, 'dataset', datasetId);
    let result = await r.db('mcpub').table('useful2item').insert(create, {returnChanges: 'always'});
    return result.changes[0].new_val;
};

const unmarkDatasetAsUseful = async(datasetId, userId) => {
    let result = await r.db('mcpub').table('useful2item').getAll([userId, dataset_id], {index: 'user_item'}).delete({returnChanges: 'always'});
    return result.changes[0].old_val;
};

const getMostPopularTagsForDatasets = async() => {
    return await r.table('tags').eqJoin('id', r.table('tag2dataset'), {index: 'tag'}).zip()
        .group(r.row('tag')).count().ungroup().orderBy(r.desc('reduction'))
        .map((doc) => ({tag: doc('group'), count: doc('reduction')}))
        .limit(20);
};

module.exports = {
    getDataset,
    getTopViewedDatasets,
    getRecentlyPublishedDatasets,
    getDatasetsForTag,
    getProcessForDataset,
    getCommentsForDataset,
    incrementViewForDataset,
    markDatasetAsUseful,
    unmarkDatasetAsUseful,
    getMostPopularTagsForDatasets
};