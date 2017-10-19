const r = require('actionhero').api.r;

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

module.exports.getAllCount = async () => {
    return await r.db('materialscommons').table('datasets').filter({published: true}).count();
};

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