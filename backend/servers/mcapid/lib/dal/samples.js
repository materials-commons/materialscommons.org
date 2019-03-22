const model = require('@lib/model');

module.exports = function(r) {

    const db = require('./db')(r);

    async function getSamplesForProject(projectId) {
        return await r.table('project2sample').getAll(projectId, {index: 'project_id'})
            .eqJoin('sample_id', r.table('samples')).zip()
            .without('group_size', 'has_group', 'is_grouped', 'permissions', 'project_id',
                'project_name', 'sample_id', 'status', 'user_id')
            .merge(sampleOverviewRql);
    }

    function sampleOverviewRql(s) {
        return {
            files_count: r.table('sample2datafile').getAll(s('id'), {index: 'sample_id'}).count(),
            processes_count: r.table('process2sample').getAll(s('id'), {index: 'sample_id'}).distinct('process_id').count(),
            experiments: r.table('experiment2sample').getAll(s('id'), {index: 'sample_id'})
                .eqJoin('experiment_id', r.table('experiments')).zip().pluck('name', 'id').coerceTo('array'),
        };
    }

    async function getSample(sampleId, userId) {
        return await r.table('access').getAll(userId, {index: 'user_id'})
            .eqJoin([r.row('project_id'), sampleId], r.table('project2sample'), {index: 'project_sample'}).zip().limit(1)
            .eqJoin('sample_id', r.table('samples')).zip()
            .without('group_size', 'has_group', 'is_grouped', 'permissions', 'project_id',
                'project_name', 'sample_id', 'status', 'user_id')
            .nth(0).merge(sampleDetailsRql);
    }

    function sampleDetailsRql(s) {
        return {
            processes: r.table('process2sample').getAll(s('id'), {index: 'sample_id'})
                .eqJoin('process_id', r.table('processes')).zip()
                .pluck('birthtime', 'id', 'property_set_id', 'description', 'name')
                .coerceTo('array'),
            files: r.table('sample2datafile').getAll(s('id'), {index: 'sample_id'})
                .eqJoin('datafile_id', r.table('datafiles')).zip()
                .without('atime', 'birthtime', 'checksum', 'current', 'datafile_id',
                    'description', 'mtime', 'parent', 'sample_id')
                .coerceTo('array'),
            attribute_sets: sampleAttributeSetsRql(s),
        };
    }

    function sampleAttributeSetsRql(s) {
        return r.table('sample2propertyset').getAll(s('id'), {index: 'sample_id'})
            .eqJoin('property_set_id', r.table('propertysets')).zip()
            .without('parent_id', 'sample_id', 'version', 'property_set_id')
            .merge(ps => {
                return {
                    attributes: r.table('propertyset2property').getAll(ps('id'), {index: 'property_set_id'})
                        .eqJoin('property_id', r.table('properties')).zip()
                        .without('parent_id', 'property_id', 'property_set_id', 'birthtime')
                        .merge(a => {
                            return {
                                best_measure: r.branch(a('best_measure_id').eq(''), 'None',
                                    r.table('best_measure_history').getAll(a('best_measure_id'))
                                        .eqJoin('measurement_id', r.table('measurements')).zip().pluck('unit', 'value').nth(0)
                                )
                            };
                        }).coerceTo('array'),
                    processes: r.table('process2sample').getAll([s('id'), ps('id')], {index: 'sample_property_set'})
                        .eqJoin('process_id', r.table('processes')).zip().pluck('id', 'name').coerceTo('array'),
                };
            }).coerceTo('array');
    }

    async function addSampleToProject(sampleId, projectId) {
        const proj2sample = new model.Project2Sample(projectId, sampleId);
        await db.insert('project2sample', proj2sample);
    }

    async function addSampleToExperiment(sampleId, experimentId) {
        const e2s = new model.Experiment2Sample(experimentId, sampleId);
        await db.insert('experiment2sample', e2s);
    }

    async function createSampleInProcess(name, description, owner, processId, projectId) {
        let pset = new model.PropertySet(true);
        let createdPSet = await db.insert('propertysets', pset);
        let s = new model.Sample(name, description, owner);
        let createdSample = await db.insert('samples', s);
        let s2ps = new model.Sample2PropertySet(createdSample.id, createdPSet.id, true);
        await db.insert('sample2propertyset', s2ps);
        let proc2sample = new model.Process2Sample(processId, createdSample.id, createdPSet.id, 'out');
        let proj2sample = new model.Project2Sample(projectId, createdSample.id);
        await db.insert('process2sample', proc2sample);
        await db.insert('project2sample', proj2sample);

        return createdSample;
    }

    async function addSampleToProcess(sampleId, propertySetId, processId, transform) {
        return {};
    }

    async function addMeasurementsToSampleInProcess(attributes, sampleId, propertySetId, processId) {
        return {};
    }

    async function addAttributesToSampleInProcess(attributes, sampleId, processId) {
        return {};
    }

    return {
        getSamplesForProject,
        getSample,
        addSampleToProject,
        addSampleToExperiment,
        createSampleInProcess,
        addSampleToProcess,
        addMeasurementsToSampleInProcess,
        addAttributesToSampleInProcess,
    };
};