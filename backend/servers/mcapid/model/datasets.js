const r = require('../lib/r');
const commonQueries = require('../lib/queries/common-queries');

module.exports.getAll = async () => {
    return await r.table('datasets').filter({published: true}).merge((ds) => {
        return {
            'file_count': r.db('mcpub').table('dataset2datafile').getAll(ds('id'), {index: 'dataset_id'}).count(),
            'appreciations': r.db('mcpub').table('appreciations').getAll(ds('id'), {index: 'dataset_id'}).count(),
            'views': r.db('mcpub').table('views').getAll(ds('id'), {index: 'dataset_id'}).count()
        }
    });
};

// module.exports.getDatasetProcess = async () => {
//     let rv = yield processCommon.getProcess(r, this.params.process_id);
//     this.body = rv.val;
//     yield next;
// };

module.exports.getRecent = async () => {
    return await r.db('materialscommons').table('datasets').filter({published: true})
        .orderBy(r.desc('birthtime')).merge((ds) => {
            return {
                'file_count': r.db('mcpub').table('dataset2datafile').getAll(ds('id'), {index: 'dataset_id'}).count(),
                'appreciations': r.db('mcpub').table('appreciations').getAll(ds('id'), {index: 'dataset_id'}).count(),
                'views': r.db('mcpub').table('views').getAll(ds('id'), {index: 'dataset_id'}).count()
            }
        }).limit(10);
};

module.exports.getTopViews = async () => {
    return await r.db('materialscommons').table('datasets').filter({published: true}).merge(function(ds) {
        return {
            'file_count': r.db('mcpub').table('dataset2datafile').getAll(ds('id'), {index: 'dataset_id'}).count(),
            'appreciations': r.db('mcpub').table('appreciations').getAll(ds('id'), {index: 'dataset_id'}).count(),
            'views': r.db('mcpub').table('views').getAll(ds('id'), {index: 'dataset_id'}).count()
        }
    }).orderBy(r.desc('views')).limit(10);
};

module.exports.getDataset = async (datasetId, userId) => {
    try {
        let processesRql = commonQueries.processDetailsRql(r.db('mcpub').table('dataset2process')
            .getAll(datasetId, {index: 'dataset_id'})
            .eqJoin('process_id', r.db('mcpub').table('processes')).zip(), r);
        let dataset = await r.db('materialscommons').table('datasets').get(datasetId).merge((ds) => {
            return {
                files: r.db('mcpub').table('dataset2datafile').getAll(ds('id'), {index: 'dataset_id'})
                    .eqJoin('datafile_id', r.table('datafiles')).zip().coerceTo('array'),
                other_datasets: r.db('materialscommons').table('datasets').getAll(ds('owner'), {index: "owner"})
                    .filter({published: true}).merge((od) => {
                        return {
                            'files': r.db('mcpub').table('dataset2datafile').getAll(od('id'), {index: 'dataset_id'})
                                .eqJoin('datafile_id', r.db('mcpub').table('datafiles')).zip().coerceTo('array')
                        }
                    }).coerceTo('array'),
                tags: r.db('mcpub').table('tag2dataset').getAll(ds('id'), {index: "dataset_id"})
                    .map((row) => r.db('mcpub').table('tags').get(row('tag'))).coerceTo('array'),
                processes: processesRql.coerceTo('array'),
                samples: r.db('mcpub').table('dataset2sample').getAll(ds('id'), {index: 'dataset_id'})
                    .map((row) => r.db('mcpub').table('samples').get(row('sample_id'))).coerceTo('array'),
                publisher: (!ds('owner')) ? 'unknown' : r.db('materialscommons').table('users').get(ds('owner')).getField("fullname")
            }
        });
        if (userId) {
            const is_appreciated = await r.db('mcpub').table('appreciations')
                .getAll([userId, datasetId], {index: 'user_dataset'});
            if (is_appreciated.length > 0) {
                dataset.appreciate = true;
            }
        }
        if (dataset.doi) {
            dataset.doi_url = doiUrlLink(this.body.doi);
        }

        return dataset;
    } catch (e) {
        throw new Error(`Error retrieving dataset id ${datasetId}`);
    }
};

const doiUrl = process.env.MC_DOI_SERVICE_URL || 'https://ezid.lib.purdue.edu/';

const doiUrlLink = (doi) => doi ? `${doiUrl}id/${doi}` : "";