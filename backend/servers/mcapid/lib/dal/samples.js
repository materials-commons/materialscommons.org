const model = require('@lib/model');
const {nameToAttr} = require('@lib/util');
const _ = require('lodash');

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
            processes_count: r.table('process2sample').getAll(s('id'), {index: 'sample_id'}).pluck('process_id').distinct().count(),
            experiments: r.table('experiment2sample').getAll(s('id'), {index: 'sample_id'})
                .eqJoin('experiment_id', r.table('experiments')).zip().pluck('name', 'id').coerceTo('array'),
        };
    }

    async function getSamplesWithProcessAttributesForExperiment(experimentId) {
        return await r.table('experiment2sample').getAll(experimentId, {index: 'experiment_id'})
            .eqJoin('sample_id', r.table('samples')).zip()
            .without('group_size', 'has_group', 'is_grouped', 'permissions', 'project_id',
                'project_name', 'sample_id', 'status', 'user_id')
            .merge(sampleConditionsOverviewRql);
    }

    async function getSamplesWithConditionsForProject(projectId) {
        return await r.table('project2sample').getAll(projectId, {index: 'project_id'})
            .eqJoin('sample_id', r.table('samples')).zip()
            .without('group_size', 'has_group', 'is_grouped', 'permissions', 'project_id',
                'project_name', 'sample_id', 'status', 'user_id')
            .merge(sampleConditionsOverviewRql);
    }

    function sampleConditionsOverviewRql(s) {
        return {
            files_count: r.table('sample2datafile').getAll(s('id'), {index: 'sample_id'}).count(),
            experiments: r.table('experiment2sample').getAll(s('id'), {index: 'sample_id'})
                .eqJoin('experiment_id', r.table('experiments')).zip().pluck('name', 'id').coerceTo('array'),
            processes: r.table('process2sample').getAll(s('id'), {index: 'sample_id'})
                .eqJoin('process_id', r.table('processes')).zip().pluck('name', 'id').distinct()
                .merge(proc => {
                    return {
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
                            }).coerceTo('array')
                    };
                })
                .coerceTo('array')
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

    async function getSampleSimple(sampleId) {
        return await r.table('samples').get(sampleId);
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
                                        .eqJoin('measurement_id', r.table('measurements')).zip().pluck('measurement_id', 'unit', 'value').nth(0),
                                ),
                                measurements: r.table('property2measurement').getAll(a('id'), {index: 'property_id'})
                                    .eqJoin('measurement_id', r.table('measurements')).zip()
                                    .pluck('id', 'otype', 'unit', 'value')
                                    .coerceTo('array'),
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
        let matches = await r.table('experiment2sample').getAll([experimentId, sampleId], {index: 'experiment_sample'});
        if (matches.length === 0) {
            const e2s = new model.Experiment2Sample(experimentId, sampleId);
            await db.insert('experiment2sample', e2s);
        }
    }

    async function createSampleInProcess(name, description, owner, processId, projectId) {
        let pset = new model.PropertySet(true);
        let createdPSet = await db.insert('propertysets', pset);
        let s = new model.Sample(name, description, owner);
        let createdSample = await db.insert('samples', s);
        createdSample.property_set_id = createdPSet.id;
        let s2ps = new model.Sample2PropertySet(createdSample.id, createdPSet.id, true);
        await db.insert('sample2propertyset', s2ps);
        let proc2sample = new model.Process2Sample(processId, createdSample.id, createdPSet.id, 'out');
        let proj2sample = new model.Project2Sample(projectId, createdSample.id);
        await db.insert('process2sample', proc2sample);
        await db.insert('project2sample', proj2sample);
        await addSamplesToExperimentsForProcess([{sample_id: createdSample.id}], processId);

        return createdSample;
    }

    // addSampleToProcess adds the sample to the process, potentially transforming the sample. Transforming the sample
    // means adding a new property set to the sample. It returns true on success and throws an Error on failure.
    async function addSampleToProcess(sampleId, propertySetId, processId, transform) {
        let proc2sample = new model.Process2Sample(processId, sampleId, propertySetId, 'in');
        await db.insertSoft('process2sample', proc2sample);
        if (transform) {
            // If the sample is transformed by the process then we need to create a new property set
            // for the sample and set it as an output of the process.
            let pset = new model.PropertySet(true);
            let createdPSet = await db.insertSoftWithChanges('propertysets', pset);
            let s2ps = new model.Sample2PropertySet(sampleId, createdPSet.id, true);
            await db.insertSoft('sample2propertyset', s2ps);
            let p2s = new model.Process2Sample(processId, sampleId, createdPSet.id, 'out');
            await db.insertSoft('process2sample', p2s);
            return createdPSet.id;
        }
        return propertySetId;
    }

    async function addSamplesToProcess(samples, processId, transform) {
        let samplesToAdd = await removeExistingProcessSampleEntries(processId, samples);
        let p2sArray = samplesToAdd.map(s => new model.Process2Sample(processId, s.sample_id, s.property_set_id, 'in'));
        await db.insertSoft('process2sample', p2sArray);

        /*
        ** Processes are in experiments, so we need to add the samples to the experiments for the processes that
        ** the samples are in.
         */
        await addSamplesToExperimentsForProcess(samples, processId);
        if (transform) {
            // Create a bunch of PropertySets, then we will match those up to samples
            let psets = samplesToAdd.map(() => new model.PropertySet(true));
            let createdPSets = await db.insertSoftWithChanges('propertysets', psets, {toArray: true});
            let s2psArray = [],
                p2sArray = [];
            for (let i = 0; i < samplesToAdd.length; i++) {
                s2psArray.push(new model.Sample2PropertySet(samplesToAdd[i].sample_id, createdPSets[i].id));
                p2sArray.push(new model.Process2Sample(processId, samplesToAdd[i].sample_id, createdPSets[i].id, 'out'));
            }

            await db.insertSoft('sample2propertyset', s2psArray);
            await db.insertSoft('process2sample', p2sArray);

            return s2psArray;
        }

        // If transform is false then a new property set wasn't created, so we can just return the original list.
        return samplesToAdd;
    }

    async function removeExistingProcessSampleEntries(processId, samples) {
        if (samples.length) {
            let indexEntries = samples.map(f => [processId, f.sample_id, f.property_set_id]);
            let matchingEntries = await r.table('process2sample').getAll(r.args(indexEntries), {index: 'process_sample_property_set'});
            let bySampleID = _.keyBy(matchingEntries, e => `${e.sample_id}/${e.property_set_id}`);
            return samples.filter(s => (!(`${s.sample_id}/${s.property_set_id}` in bySampleID)));
        }

        return samples;
    }

    async function addSamplesToExperimentsForProcess(samples, processId) {
        let e2p = await r.table('experiment2process').getAll(processId, {index: 'process_id'});
        let e2sArray = [];
        e2p.forEach(entry => {
            samples.forEach(s => {
                e2sArray.push(new model.Experiment2Sample(entry.experiment_id, s.sample_id));
            });
        });

        if (e2sArray.length) {
            let e2s = await removeExistingExperimentSampleEntries(e2sArray);
            if (e2s.length) {
                await db.insertSoft('experiment2sample', e2s);
            }
        }
    }

    async function removeExistingExperimentSampleEntries(e2s) {
        let entries = e2s.map(entry => [entry.experiment_id, entry.sample_id]);
        let matchingEntries = await r.table('experiment2sample').getAll(r.args(entries), {index: 'experiment_sample'});
        if (matchingEntries.length) {
            let bySampleId = _.keyBy(matchingEntries, 'sample_id');
            return e2s.filter(e => (!(e.sample_id in bySampleId)));
        }

        return e2s;
    }

    async function addMeasurementsToSampleInProcess(attributes, sampleId, propertySetId, processId) {
        for (let attr of attributes) {
            if (attr.id && attr.id !== '') {
                // Attribute has an existing id which means it already exists in the database.
                // So we are adding measurements to an existing attribute.
                await addMeasurementsToExistingAttribute(attr, sampleId, processId);
            } else {
                // Adding new attributes
                await addAttributeToExistingSampleInProcess(attr, sampleId, propertySetId, processId);
            }
        }

        return true;
    }

    async function addMeasurementsToExistingAttribute(attr, sampleId, propertySetId, processId) {
        for (let m of attr.measurements) {
            await addMeasurement(attr.name, m, attr.id, sampleId, processId);
        }
    }

    async function addAttributeToExistingSampleInProcess(attr, sampleId, propertSetId, processId) {
        await addAttributesToSampleInProcess([attr], sampleId, propertSetId, processId);
    }

    async function addAttributesToSampleInProcess(attributes, sampleId, propertySetId, processId) {
        for (let attr of attributes) {
            let p = new model.Property(attr.name, nameToAttr(attr.name));
            let createdProperty = await db.insertSoftWithChanges('properties', p);
            let ps2p = new model.PropertySet2Property(createdProperty.id, propertySetId);
            await db.insertSoft('propertyset2property', ps2p);
            for (let measurement of attr.measurements) {
                await addMeasurement(attr.name, measurement, createdProperty.id, sampleId, processId);
            }
        }
        return true;
    }

    async function addMeasurement(attrName, measurement, propertyId, sampleId, processId) {
        let m = new model.Measurement(attrName, null, sampleId);
        m.value = measurement.value;
        m.unit = measurement.unit;
        m.otype = measurement.otype;
        let createdMeas = await db.insertSoftWithChanges('measurements', m);
        if (measurement.is_best_measure) {
            await addAsBestMeasure(propertyId, createdMeas.id);
        }
        await addMeasurementToProperty(propertyId, createdMeas.id);
        await addMeasurementToProcess(processId, createdMeas.id);
    }

    async function addAsBestMeasure(propertyId, measurementId) {
        let existing = await r.table('best_measure_history').getAll(propertyId, {index: 'property_id'});
        if (!existing.length) {
            let bmh = new model.BestMeasureHistory(propertyId, measurementId);
            let inserted = await db.insertSoftWithChanges('best_measure_history', bmh);
            await r.table('properties').get(propertyId).update({best_measure_id: inserted.id});
        } else {
            await r.table('best_measure_history').get(existing[0].id).update({measurement_id: measurementId});
            await r.table('properties').get(propertyId).update({best_measure_id: existing[0].id});
        }

        return true;
    }

    async function addMeasurementToProperty(propertyId, measurementId) {
        let a2m = new model.Property2Measurement(propertyId, measurementId);
        await db.insertSoft('property2measurement', a2m);
    }

    async function addMeasurementToProcess(processId, measurementId) {
        let p2m = new model.Process2Measurement(processId, measurementId);
        await db.insertSoft('process2measurement', p2m);
    }

    return {
        getSamplesForProject,
        getSamplesWithProcessAttributesForExperiment,
        getSamplesWithConditionsForProject,
        getSample,
        getSampleSimple,
        addSampleToProject,
        addSampleToExperiment,
        createSampleInProcess,
        addSampleToProcess,
        addSamplesToProcess,
        addMeasurementsToSampleInProcess,
        addAsBestMeasure,
    };
};