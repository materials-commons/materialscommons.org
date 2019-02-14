const r = require('../../../shared/r');

const getSample = async (userId, sampleId) => {
    return await r.table('access').getAll(userId, {index: 'user_id'})
        .eqJoin([r.row('project_id'), sampleId], r.table('project2sample'), {index: 'project_sample'}).zip().limit(1)
        .eqJoin('sample_id', r.table('samples')).zip().nth(0).merge(sampleDetailsRql);
};

function sampleDetailsRql(s) {
    return {};
}

module.exports = {
    getSample,
};