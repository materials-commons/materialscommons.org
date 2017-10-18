const {api} = require('actionhero');

module.exports.getAll = async () => {
    return await api.r.table('datasets').filter({published: true}).merge((ds) => {
        return {
            'file_count': api.r.db('mcpub').table('dataset2datafile').getAll(ds('id'), {index: 'dataset_id'}).count(),
            'appreciations': api.r.db('mcpub').table('appreciations').getAll(ds('id'), {index: 'dataset_id'}).count(),
            'views': api.r.db('mcpub').table('views').getAll(ds('id'), {index: 'dataset_id'}).count()
        }
    });
};