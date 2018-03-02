const r = require('../../../shared/r');
const commonQueries = require('../../../lib/common-queries');

function addExperimentComputed(rql) {
    rql = rql.merge((experiment) => {
        return {
            tasks: r.table('experiment2experimenttask')
                .getAll(experiment('id'), {index: 'experiment_id'})
                .eqJoin('experiment_task_id', r.table('experimenttasks')).zip()
                .filter({parent_id: ''})
                .orderBy('index')
                .coerceTo('array'),
            notes: r.table('experiment2experimentnote')
                .getAll(experiment('id'), {index: 'experiment_id'})
                .eqJoin('experiment_note_id', r.table('experimentnotes')).zip()
                .orderBy('name')
                .coerceTo('array'),
            samples: r.table('experiment2sample').getAll(experiment('id'), {index: 'experiment_id'})
                .eqJoin('sample_id', r.table('samples')).zip()
                .merge(function (s) {
                    return {
                        process_count: r.table('process2sample').getAll(s('id'), {index: 'sample_id'}).count()
                    };
                })
                .orderBy('name')
                .coerceTo('array'),
            files_count: r.table('experiment2datafile').getAll(experiment('id'), {index: 'experiment_id'}).count(),
            processes: commonQueries.processDetailsRql(r.table('experiment2process').getAll(experiment('id'), {index: 'experiment_id'})
                .eqJoin('process_id', r.table('processes')).zip(), r).coerceTo('array'),
            datasets: r.table('experiment2dataset').getAll(experiment('id'), {index: 'experiment_id'})
                .eqJoin('dataset_id', r.table('datasets')).zip()
                .orderBy('title')
                .coerceTo('array')
        }
    });

    return rql;
}

module.exports = {
    addExperimentComputed
};