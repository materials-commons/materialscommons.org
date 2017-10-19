const r = require('actionhero').api.r;
const dbExec = require('./run');
const model = require('./model');
const db = require('./db');
const _ = require('lodash');

async function getSample(sampleID) {
    let rql = r.table('samples').get(sampleID)
        .merge(function(sample) {
            return {
                processes: r.table('process2sample').getAll(sample('id'), {index: 'sample_id'})
                    .eqJoin('process_id', r.table('processes')).zip()
                    .merge(function(process) {
                        return {
                            measurements: r.table('process2measurement')
                                .getAll(process('process_id'), {index: 'process_id'})
                                .eqJoin('measurement_id', r.table('measurements')).zip().coerceTo('array'),
                            experiments: r.table('experiment2process')
                                .getAll(process('process_id'), {index: 'process_id'})
                                .eqJoin('experiment_id', r.table('experiments')).zip().coerceTo('array')
                        };
                    }).orderBy('birthtime').coerceTo('array'),
                files: r.table('sample2datafile').getAll(sample('id'), {index: 'sample_id'})
                    .eqJoin('datafile_id', r.table('datafiles')).zip().coerceTo('array'),
                experiments: r.table('experiment2sample')
                    .getAll(sampleID, {index: 'sample_id'})
                    .eqJoin('experiment_id', r.table('experiments')).zip().coerceTo('array')
            }
        });
    let sample = await dbExec(rql);
    return {val: sample};
}

async function getAllSamplesForProject(projectID) {
    // let projectSamplesRql = r.table('project2sample').getAll(projectID, {index: 'project_id'})
    //     .eqJoin('sample_id', r.table('sample2propertyset'), {index: 'sample_id'})
    //     .zip().filter({'current': true})
    //     .eqJoin('sample_id', r.table('samples')).zip();
    let rql = r.table('project2sample').getAll(projectID, {index: 'project_id'})
        .eqJoin('sample_id', r.table('samples')).zip()
        .merge(function(sample) {
            return {
                versions: r.table('process2sample').getAll(sample('id'), {index: 'sample_id'})
                    .filter({direction: 'out'})
                    .eqJoin('process_id', r.table('processes')).zip()
                    .coerceTo('array'),
                processes: r.table('process2sample').getAll(sample('id'), {index: 'sample_id'})
                    .eqJoin('process_id', r.table('processes')).zip().coerceTo('array'),
                experiments: r.table('experiment2sample')
                    .getAll(sample('id'), {index: 'sample_id'})
                    .eqJoin('experiment_id', r.table('experiments')).zip().coerceTo('array'),
                files: r.table('sample2datafile').getAll(sample('id'), {index: 'sample_id'})
                    .eqJoin('datafile_id', r.table('datafiles')).zip().coerceTo('array')
            }
        });
    let samples = await dbExec(rql);
    return {val: samples};
}

async function getAllSamplesForExperiment(experimentId) {
    let rql = r.table('experiment2sample').getAll(experimentId, {index: 'experiment_id'})
        .eqJoin('sample_id', r.table('samples')).zip()
        .merge(function(sample) {
            return {
                versions: r.table('process2sample').getAll(sample('id'), {index: 'sample_id'})
                    .filter({direction: 'out'})
                    .eqJoin('process_id', r.table('processes')).zip()
                    .coerceTo('array'),
                processes: r.table('process2sample').getAll(sample('id'), {index: 'sample_id'})
                    .eqJoin('process_id', r.table('processes')).zip().coerceTo('array'),
                experiments: r.table('experiment2sample')
                    .getAll(sample('id'), {index: 'sample_id'})
                    .eqJoin('experiment_id', r.table('experiments')).zip().coerceTo('array')
            }
        });
    let samples = await dbExec(rql);
    return {val: samples};
}

// async function getAllSamplesFromQuery(query) {
//     let rql = commonQueries.sampleDetailsRql(query, r);
//     let samples = await dbExec(rql);
//     samples = samples.map(s => {
//         s.transforms = s.processes.filter(p => p.does_transform).length;
//         s.properties = s.properties.map(p => {
//             if (p.best_measure.length) {
//                 p.best_measure = p.best_measure[0];
//             } else {
//                 p.best_measure = null;
//             }
//             return p;
//         });
//         return s;
//     });
//     return {val: samples};
// }

async function createSamples(projectId, processId, samples, owner) {
    let pset = new model.PropertySet(true);
    let createdPSet = await db.insert('propertysets', pset);
    let createdSamples = [];
    for (let i = 0; i < samples.length; i++) {
        let sampleParams = samples[i];
        let s = new model.Sample(sampleParams.name, sampleParams.description, owner);
        let createdSample = await db.insert('samples', s);
        let s2ps = new model.Sample2PropertySet(createdSample.id, createdPSet.id, true);
        await db.insert('sample2propertyset', s2ps);
        let proc2sample = new model.Process2Sample(processId, createdSample.id, createdPSet.id, 'out');
        let proj2sample = new model.Project2Sample(projectId, createdSample.id);
        await db.insert('process2sample', proc2sample);
        await db.insert('project2sample', proj2sample);
        createdSamples.push({
            name: s.name,
            id: createdSample.id,
            property_set_id: createdPSet.id,
            otype: createdSample.otype
        });
    }

    return {val: {samples: createdSamples}};
}

async function isValidCreateSamplesProcess(projectId, processId) {
    let processes = await r.table('project2process').getAll([projectId, processId], {index: 'project_process'});
    if (processes.length === 0) {
        return false;
    }
    let process = await r.table('processes').get(processId)
        .merge((p) => r.table('templates').get(p('template_id')).pluck('category'));
    return (process.category === 'create_sample') || (process.category === 'sectioning');
}

async function updateSamples(samples) {
    await r.table('samples').insert(samples, {conflict: 'update'});
    return {val: samples};
}

async function addSamplesMeasurements(processId, properties) {
    for (let i = 0; i < properties.length; i++) {
        let prop = properties[i];
        if (prop.add_as === 'shared') {
            await addSharedPropertyMeasurementsForSamples(processId, prop);
        } else {
            await addSeparatePropertyMeasurementsForSamples(processId, prop);
        }
    }
    return {val: true};
}

async function addSharedPropertyMeasurementsForSamples(processId, prop) {
    let p = new model.Property(prop.name, prop.attribute);
    let insertedProperty = await db.insert('properties', p);
    await addPropertyMeasurements(processId, insertedProperty.id, "", prop.name, prop.attribute, prop.measurements);
    for (let i = 0; i < prop.samples.length; i++) {
        let s = prop.samples[i];
        await addPropertyToPropertySet(insertedProperty.id, s.property_set_id);
    }
}

async function addPropertyToPropertySet(propertyId, psetId) {
    let ps2p = new model.PropertySet2Property(propertyId, psetId);
    await db.insert('propertyset2property', ps2p);
}

async function addPropertyMeasurements(processId, propertyId, sampleId, pName, pAttr, measurements) {
    for (let i = 0; i < measurements.length; i++) {
        let current = measurements[i];
        let m = new model.Measurement(pName, pAttr, sampleId);
        m.value = current.value;
        m.unit = current.unit;
        m.otype = current.otype;
        let insertedMeasurement = await db.insert('measurements', m);
        if (current.is_best_measure) {
            await addAsBestMeasure(propertyId, insertedMeasurement.id)
        }
        await addMeasurementToProperty(propertyId, insertedMeasurement.id);
        await addMeasurementToProcess(processId, insertedMeasurement.id);
    }
}

async function addMeasurementToProperty(propID, mID) {
    let a2m = new model.Property2Measurement(propID, mID);
    await db.insert('property2measurement', a2m);
}

async function addMeasurementToProcess(processId, mId) {
    let p2m = new model.Process2Measurement(processId, mId);
    await db.insert('process2measurement', p2m);
}

async function addSeparatePropertyMeasurementsForSamples(processId, prop) {
    for (let i = 0; i < prop.samples.length; i++) {
        let s = prop.samples[i];
        await addNewPropertyMeasurements(processId, s.id, s.property_set_id, prop.property, prop.measurements);
    }
}

async function addAsBestMeasure(propertyID, measurementID) {
    let existing = await r.table('best_measure_history').getAll(propertyID, {index: 'property_id'});
    if (!existing.length) {
        let bmh = new model.BestMeasureHistory(propertyID, measurementID);
        let inserted = await db.insert('best_measure_history', bmh);
        await r.table('properties').get(propertyID).update({best_measure_id: inserted.id});
    } else {
        await r.table('best_measure_history').get(existing[0].id).update({measurement_id: measurementID});
    }
}

async function addNewPropertyMeasurements(processId, sampleID, psetID, prop, measurements) {
    let propertyId;
    let matches = await r.table('propertyset2property').getAll(psetID, {index: 'property_set_id'})
        .eqJoin('property_id', r.table('properties')).zip().filter({attribute: prop.attribute});
    if (matches.length) {
        propertyId = matches[0].property_id;
    } else {
        let p = new model.Property(prop.name, prop.attribute);
        let inserted = await db.insert('properties', p);
        propertyId = inserted.id;
        let ps2p = new model.PropertySet2Property(inserted.id, psetID);
        await db.insert('propertyset2property', ps2p);
    }
    await addPropertyMeasurements(processId, propertyId, sampleID, prop.name, prop.attribute, measurements);
}

async function updateSamplesMeasurements() {
    for (let i = 0; i < properties.length; i++) {
        let prop = properties[i];
        let measurementsToAdd = prop.measurements.filter((m) => !m.id);
        let measurementsToUpdate = prop.measurements.filter((m) => m.id);
        let propToAdd = _.clone(prop),
            propToUpdate = _.clone(prop);
        propToAdd.measurements = measurementsToAdd;
        propToUpdate.measurements = measurementsToUpdate;
        if (propToAdd.measurements.length) {
            if (propToAdd.add_as === 'shared') {
                await addSharedPropertyMeasurementsForSamples(propToAdd);
            } else {
                await addSeparatePropertyMeasurementsForSamples(propToAdd);
            }
        }

        if (propToUpdate.measurements.length) {
            await updatedExistingPropertyMeasurementsForSamples(propToUpdate);
        }
    }

    return {val: true};
}

async function updatedExistingPropertyMeasurementsForSamples(prop) {
    let measurementsWithUpdates = prop.measurements.map((m) => {
        return {id: m.id, unit: m.unit, value: m.value};
    });
    await r.table('measurements').insert(measurementsWithUpdates, {conflict: 'update'});
}

async function deleteSamplesMeasurements() {
    return null;
}

async function updateSampleFiles(sampleId, sampleFiles) {
    let fileSamplesToAdd = sampleFiles.filter(s2d => s2d.command === 'add')
        .map(s2d => new model.Sample2Datafile(sampleId, s2d.id));
    fileSamplesToAdd = await removeExistingSampleFileEntries(fileSamplesToAdd);
    if (fileSamplesToAdd.length) {
        await r.table('sample2datafile').insert(fileSamplesToAdd);
    }

    let fileSamplesToDelete = sampleFiles.filter(s2d => s2d.command === 'delete').map(s2d => [sampleId, s2d.id]);
    if (fileSamplesToDelete.length) {
        await r.table('sample2datafile').getAll(r.args(fileSamplesToDelete), {index: 'sample_file'}).delete();
    }

    return {val: true};
}

async function removeExistingSampleFileEntries(sampleFileEntries) {
    if (sampleFileEntries.length) {
        let indexEntries = sampleFileEntries.map(entry => [entry.sample_id, entry.datafile_id]);
        let matchingEntries = await r.table('sample2datafile').getAll(r.args(indexEntries), {index: 'sample_file'});
        let byFileID = _.keyBy(matchingEntries, 'datafile_id');
        return sampleFileEntries.filter(entry => (!(entry.datafile_id in byFileID)));
    }
    return sampleFileEntries;
}

module.exports = {
    getSample,
    getAllSamplesForProject,
    getAllSamplesForExperiment,
    createSamples,
    isValidCreateSamplesProcess,
    updateSamples,
    addSamplesMeasurements,
    updateSamplesMeasurements,
    deleteSamplesMeasurements,
    updateSampleFiles
};
