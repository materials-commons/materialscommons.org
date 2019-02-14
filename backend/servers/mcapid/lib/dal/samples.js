const r = require('../../../shared/r');

const getSamplesForProject = async(projectId) => {
    return await r.table('project2sample').getAll(projectId, {index: 'project_id'})
        .eqJoin('sample_id', r.table('samples')).zip().merge(sampleOverviewRql);
};

function sampleOverviewRql(s) {
    return {
        files_count: r.table('sample2datafile').getAll(s('id'), {index: 'sample_id'}).count(),
        processes_count: r.table('process2sample').getAll(s('id'), {index: 'sample_id'}).distinct('process_id').count(),
        experiments: r.table('experiment2sample').getAll(s('id'), {index: 'sample_id'})
            .eqJoin('experiment_id', r.table('experiments')).zip().pluck('name', 'id').coerceTo('array'),
    };
}

const getSample = async(userId, sampleId) => {
    return await r.table('access').getAll(userId, {index: 'user_id'})
        .eqJoin([r.row('project_id'), sampleId], r.table('project2sample'), {index: 'project_sample'}).zip().limit(1)
        .eqJoin('sample_id', r.table('samples')).zip().nth(0).merge(sampleDetailsRql);
};

function sampleDetailsRql(s) {
    return {};
}

module.exports = {
    getSamplesForProject,
    getSample,
};