const model = require('@lib/model');
const {nameToAttr} = require('@lib/util');

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
                .eqJoin('process_id', r.table('processes')).zip().pluck('name', 'id')
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
        createdSample.property_set_id = createdPSet.id;
        let s2ps = new model.Sample2PropertySet(createdSample.id, createdPSet.id, true);
        await db.insert('sample2propertyset', s2ps);
        let proc2sample = new model.Process2Sample(processId, createdSample.id, createdPSet.id, 'out');
        let proj2sample = new model.Project2Sample(projectId, createdSample.id);
        await db.insert('process2sample', proc2sample);
        await db.insert('project2sample', proj2sample);

        return createdSample;
    }

    // addSampleToProcess adds the sample to the process, potentially transforming the sample. Transforming the sample
    // means adding a new property set to the sample. It returns true on success and throws an Error on failure.
    async function addSampleToProcess(sampleId, propertySetId, processId, transform) {
        let proc2sample = new model.Process2Sample(processId, sampleId, propertySetId, 'in');
        await db.insert('process2sample', proc2sample);
        if (transform) {
            // If the sample is transformed by the process then we need to create a new property set
            // for the sample and set it as an output of the process.
            let pset = new model.PropertySet(true);
            let createdPSet = await db.insert('propertysets', pset);
            let s2ps = new model.Sample2PropertySet(sampleId, createdPSet.id, true);
            await db.insert('sample2propertyset', s2ps);
            let p2s = new model.Process2Sample(processId, sampleId, createdPSet.id, 'out');
            await db.insert('process2sample', p2s);
            return createdPSet.id;
        }
        return propertySetId;
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
            let createdProperty = await db.insert('properties', p);
            let ps2p = new model.PropertySet2Property(createdProperty.id, propertySetId);
            await db.insert('propertyset2property', ps2p);
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
        let createdMeas = await db.insert('measurements', m);
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
            let inserted = await db.insert('best_measure_history', bmh);
            await r.table('properties').get(propertyId).update({best_measure_id: inserted.id});
        } else {
            await r.table('best_measure_history').get(existing[0].id).update({measurement_id: measurementId});
        }
    }

    async function addMeasurementToProperty(propertyId, measurementId) {
        let a2m = new model.Property2Measurement(propertyId, measurementId);
        await db.insert('property2measurement', a2m);
    }

    async function addMeasurementToProcess(processId, measurementId) {
        let p2m = new model.Process2Measurement(processId, measurementId);
        await db.insert('process2measurement', p2m);
    }

    return {
        getSamplesForProject,
        getSamplesWithConditionsForProject,
        getSample,
        addSampleToProject,
        addSampleToExperiment,
        createSampleInProcess,
        addSampleToProcess,
        addMeasurementsToSampleInProcess,
    };
};