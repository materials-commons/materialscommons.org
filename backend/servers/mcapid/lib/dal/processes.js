const model = require('@lib/model');

module.exports = function(r) {
    const {createProcessFromTemplate} = require('./process-utils/create-process')(r);

    async function getProcessesForProject(projectId) {
        return await r.table('project2process').getAll(projectId, {index: 'project_id'})
            .eqJoin('process_id', r.table('processes')).zip()
            .without('project_id', 'process_id', 'category')
            .merge(processDetailsRql);
    }

    async function getProcessForProject(projectId, processId) {
        let results = await r.table('project2process').getAll([projectId, processId], {index: 'project_process'})
            .eqJoin('process_id', r.table('processes')).zip()
            .without('project_id', 'process_id', 'category')
            .merge(processDetailsRql);

        // Query will return an array of one item
        return results[0];
    }

    async function getProcess(userId, processId) {
        return await r.table('access').getAll(userId, {index: 'user_id'})
            .eqJoin([r.row('project_id'), processId], r.table('project2process'), {index: 'project_process'}).zip().limit(1)
            .eqJoin('process_id', r.table('processes')).zip().nth(0)
            .without('project_id', 'process_id', 'category')
            .merge(processDetailsRql);
    }

    function processDetailsRql(proc) {
        return {
            samples: r.table('process2sample').getAll(proc('id'), {index: 'process_id'})
                .eqJoin('sample_id', r.table('samples')).zip()
                .pluck('name', 'id', 'direction', 'owner')
                .merge(s => {
                    return {
                        files_count: r.table('sample2datafile').getAll(s('id'), {index: 'sample_id'}).count(),
                        processes_count: r.table('process2sample').getAll(s('id'), {index: 'sample_id'}).distinct('process_id').count(),
                    };
                }).coerceTo('array'),
            files: r.table('process2file').getAll(proc('id'), {index: 'process_id'})
                .eqJoin('datafile_id', r.table('datafiles')).zip()
                .pluck('id', 'name', 'direction', 'size', 'owner')
                .merge(f => {
                    return {
                        samples_count: r.table('sample2datafile').getAll(f('id'), {index: 'datafile_id'}).count(),
                        processes_count: r.table('process2file').getAll(f('id'), {index: 'datafile_id'}).count(),
                    };
                }).coerceTo('array'),
            setup: r.table('process2setup').getAll(proc('id'), {index: 'process_id'})
                .eqJoin('setup_id', r.table('setups')).zip()
                .pluck('attribute', 'name', 'id')
                .merge(function(setup) {
                    return {
                        properties: r.table('setupproperties')
                            .getAll(setup('id'), {index: 'setup_id'})
                            .pluck('name', 'attribute', 'unit', 'value', 'id')
                            .coerceTo('array')
                    };
                }).coerceTo('array'),
            measurements: r.table('process2measurement').getAll(proc('id'), {index: 'process_id'})
                .eqJoin('measurement_id', r.table('measurements')).zip()
                .pluck('id', 'name', 'unit', 'value', 'attribute')
                .coerceTo('array'),
        };
    }

    async function createProcess(projectId, experimentId, owner) {
        let template = await r.table('templates').get('global_Generic Transform Samples Template');
        let procId = await createProcessFromTemplate(projectId, template, owner);
        let e2proc = new model.Experiment2Process(experimentId, procId);
        await r.table('experiment2process').insert(e2proc);
        return await getProcess(owner, procId);
    }

    return {
        getProcessesForProject,
        getProcessForProject,
        getProcess,
        createProcess,
    };
};