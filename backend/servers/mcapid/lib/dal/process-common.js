const r = require('../r');
const model = require('./model');
const _ = require('lodash');
const db = require('./db');
const commonQueries = require('../queries/common-queries');
const dbExec = require('./run');
const sampleCommon = require('./sample-common');

async function getProcess(dbr, processID) {
    let rql = commonQueries.processDetailsRql(dbr.table('processes').getAll(processID), dbr);
    let process = await dbExec(rql);
    if (!process.length) {
        return {error: `No such process ${processID}`};
    }
    let template = await r.table('templates').get(`global_${process[0].template_name}`);
    process = mergeTemplateIntoProcess(template, process[0]);
    process = convertDatePropertyAttributes(process);
    return {val: process};
}

function mergeTemplateIntoProcess(template, process) {
    for (pindex = 0; pindex < process.setup.length; pindex++) {
        setup = process.setup[pindex];
        if (setup.attribute === 'instrument') {
            setup.properties.forEach(function (property) {
                let i = _.findIndex(template.setup[0].properties, (tprop) => tprop.attribute === property.attribute);
                if (i > -1) {
                    template.setup[0].properties[i].value = property.value;
                    template.setup[0].properties[i].name = property.name;
                    template.setup[0].properties[i].description = property.description;
                    template.setup[0].properties[i].unit = property.unit;
                    template.setup[0].properties[i].id = property.id;
                    template.setup[0].properties[i].setup_id = property.setup_id;
                    template.setup[0].properties[i].otype = property.otype;
                    template.setup[0].properties[i].attribute = property.attribute;

                    // If selection type then modify the choices when Other is selected, since the
                    // user may have modified the value of other. We need to do this otherwise the
                    // default other in the choices will update the value and the user will lose what
                    // they set.
                    if (property.otype === 'selection') {
                        if (property.value.name === 'Other') {
                            let otherChoicesIndex = _.findIndex(template.setup[0].properties[i].choices, (c) => c.name === 'Other');
                            if (otherChoicesIndex !== -1) {
                                template.setup[0].properties[i].choices[otherChoicesIndex].value = property.value.value;
                            }
                        }
                    }
                }
            });
            process.setup[pindex] = template.setup[0]
        }
    }
    if (!process.measurements.length && template.measurements.length) {
        process.measurements = template.measurements;
    }
    return process;
}

function convertDatePropertyAttributes(process) {
    if (process.setup) {
        let setup = process.setup;
        for (let i = 0; i < setup.length; i++) {
            let s = setup[i];
            if (s.properties) {
                let properties = s.properties;
                for (let j = 0; j < properties.length; j++) {
                    let property = properties[j];
                    if (property.otype && (property.otype === 'date')) {
                        let value = property.value;
                        if (value && value.epoch_time) {
                            let date = new Date(1000 * value.epoch_time);
                            property.value = date.getTime();
                        }
                    }
                }
            }
        }
    }
    return process;
}

async function processIsUnused(processId) {
    let filesInProcess = await r.table('process2file').getAll(processId, {index: 'process_id'});
    if (filesInProcess.length) {
        return false;
    }

    let samplesInProcess = await r.table('process2sample').getAll(processId, {index: 'process_id'});
    if (samplesInProcess.length) {
        return false;
    }

    let processInDatasets = await r.table('dataset2process').getAll(processId, {index: 'process_id'});
    return processInDatasets.length === 0;
}

async function updateProcessFiles(processId, files) {
    let filesToAddToProcess = files.filter(f => f.command === 'add').map(f => new model.Process2File(processId, f.id, ''));
    filesToAddToProcess = await removeExistingProcessFileEntries(processId, filesToAddToProcess);
    if (filesToAddToProcess.length) {
        await r.table('process2file').insert(filesToAddToProcess);
    }

    let filesToDeleteFromProcess = files.filter(f => f.command === 'delete').map(f => [processId, f.id]);
    if (filesToDeleteFromProcess.length) {
        await r.table('process2file').getAll(r.args(filesToDeleteFromProcess), {index: 'process_datafile'}).delete();
    }

    return null;
}

async function removeExistingProcessFileEntries(processId, files) {
    if (files.length) {
        let indexEntries = files.map(f => [processId, f.datafile_id]);
        let matchingEntries = await r.table('process2file').getAll(r.args(indexEntries), {index: 'process_datafile'});
        let byFileID = _.keyBy(matchingEntries, 'datafile_id');
        return files.filter(f => (!(f.datafile_id in byFileID)));
    }

    return files;
}

async function updateProperties(properties) {
    // Validate that the retrieved property matches that we are updating
    let errors = [];
    for (let i = 0; i < properties.length; i++) {
        let property = properties[i];
        // getAll returns an array
        let existingPropertyMatches = await r.table('setupproperties')
            .getAll([property.id, property.setup_id], {index: 'id_setup_id'});
        if (!existingPropertyMatches.length) {
            // Skip, bad property
            errors.push({error: `No matching property/setup ${property.id}.${property.setup_id}`});
            continue;
        }
        let existingProperty = existingPropertyMatches[0];
        if (existingProperty.attribute !== property.attribute) {
            errors.push({error: `Attributes don't match: ${property.id}/${property.attribute} doesn't match ${existingProperty.attribute}`});
        } else if (existingProperty.otype !== property.otype) {
            errors.push({error: `Types don't match: ${property.id}/${property.otype} doesn't match ${existingProperty.otype}`});
        } else {
            existingProperty.value = property.value;
            existingProperty.unit = property.unit;
            existingProperty.description = property.description;
            await r.table('setupproperties').get(property.id).update(existingProperty);
        }
    }

    if (errors.length) {
        return {errors: errors};
    }

    return null;
}

async function updateProcessSamples(process, samples) {
    let processId = process.id;
    let samplesToAddToProcess = samples.filter(s => s.command === 'add')
        .map(s => new model.Process2Sample(processId, s.id, s.property_set_id, 'in'));
    samplesToAddToProcess = await removeExistingProcessSampleEntries(processId, samplesToAddToProcess);
    if (samplesToAddToProcess.length) {
        await r.table('process2sample').insert(samplesToAddToProcess);
    }

    if (process.does_transform) {
        for (let i = 0; i < samplesToAddToProcess.length; i++) {
            let sampleEntry = samplesToAddToProcess[i];
            let ps = new model.PropertySet(true, sampleEntry.property_set_id);
            let added = await db.insert('propertysets', ps);
            await r.table('sample2propertyset')
                .getAll([sampleEntry.sample_id, sampleEntry.property_set_id], {index: 'sample_property_set'})
                .update({current: false});
            let s2ps = new model.Sample2PropertySet(sampleEntry.sample_id, added.id, true);
            await r.table('sample2propertyset').insert(s2ps);
            let outp2s = new model.Process2Sample(processId, sampleEntry.sample_id, added.id, 'out');
            await r.table('process2sample').insert(outp2s);
        }
    }

    let samplesToDeleteFromProcess = samples.filter(s => s.command === 'delete')
        .map(s => [processId, s.id, s.property_set_id]);
    let sampleIds = samples.filter(s => s.command === 'delete').map(s => s.id);
    let canBeDeleted = await sampleCommon.canDeleteSamples(sampleIds, processId);
    if (!canBeDeleted) {
        // Ugh... work around - don't delete if used in other processes.
        return 'Some samples used in other processes - cannot be deleted.';
    }
    if (samplesToDeleteFromProcess.length) {
        await r.table('process2sample')
            .getAll(r.args(samplesToDeleteFromProcess), {index: 'process_sample_property_set'}).delete();
    }

    await sampleCommon.removeUnusedSamples(sampleIds);

    return null;
}


async function removeExistingProcessSampleEntries(processId, samples) {
    if (samples.length) {
        let indexEntries = samples.map(s => [processId, s.sample_id, s.property_set_id]);
        let matchingEntries = await r.table('process2sample')
            .getAll(r.args(indexEntries), {index: 'process_sample_property_set'});
        let bySampleID = _.keyBy(matchingEntries, 'sample_id');
        return samples.filter(s => (!(s.sample_id in bySampleID)));
    }

    return samples;
}

async function createProcessFromTemplate(projectId, template, owner) {
    let p = new model.Process(template.name, owner, template.id, template.does_transform);
    // TODO: Fix ugly hack, template id is global_<name>, the substring removes the global_ part.
    p.process_type = template.process_type;
    p.template_name = template.id.substring(7);
    p.category = template.category;
    let proc = await addProcess(projectId, p);
    await createSetup(proc.id, template.setup);
    return proc.id;
}

// addProcess inserts the process and add it to the project.
async function addProcess(projectID, process) {
    let p = await db.insert('processes', process);
    let p2proc = new model.Project2Process(projectID, p.id);
    await db.insert('project2process', p2proc);
    return p;
}

async function createSetup(processID, settings) {
    for (let i = 0; i < settings.length; i++) {
        let current = settings[i];

        // Create the setting
        let s = new model.Setups(current.name, current.attribute);
        let setup = await db.insert('setups', s);

        // Associate it with the process
        let p2s = new model.Process2Setup(processID, setup.id);
        await db.insert('process2setup', p2s);

        // Create each property for the setting. Add these to the
        // setting variable so we can return a setting object with
        // all of its properties.
        // TODO: Add into an array and then batch insert into setupproperties
        let props = [];
        for (let j = 0; j < current.properties.length; j++) {
            let p = current.properties[j];
            let val = p.value;
            let prop = new model.SetupProperty(setup.id, p.name, p.description, p.attribute,
                p.otype, val, p.unit);
            props.push(prop);
        }

        if (props.length) {
            await db.insert('setupproperties', props);
        }
    }
}

module.exports = {
    getProcess,
    updateProcessFiles,
    updateProperties,
    updateProcessSamples,
    createProcessFromTemplate,
    processIsUnused
};



