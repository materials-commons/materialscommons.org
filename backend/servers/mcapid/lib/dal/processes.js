const r = require('../r');
const dbExec = require('./run');
const commonQueries = require('../queries/common-queries');
const processCommon = require('./process-common');
const model = require('./model');


async function getProcess(processID) {
    return await processCommon.getProcess(r, processID);
}

async function getProjectProcesses(projectID) {
    let rql = commonQueries.processDetailsRql(r.table('project2process').getAll(projectID, {index: 'project_id'})
        .eqJoin('process_id', r.table('processes')).zip().filter(r.row('process_type').ne('as_received')), r);
    let processes = await dbExec(rql);
    return {val: processes};
}

async function getProcessTemplates() {
    let templates = await r.table('templates');
    return {val: templates};
}

async function getTemplate(templateId) {
    let rql = r.table('templates').get(templateId);
    return await dbExec(rql);
}

async function createProcessFromTemplate(projectId, templateId, owner) {
    let template = await r.table('templates').get(templateId);
    let procId = await processCommon.createProcessFromTemplate(projectId, template, owner);
    return await getProcess(procId);
}

async function updateProcess(processId, updateArgs) {
    if (updateArgs.properties.length) {
        let errors = await processCommon.updateProperties(updateArgs.properties);
        if (errors !== null) {
            return {error: errors};
        }
    }

    if (updateArgs.files.length) {
        let errors = await processCommon.updateProcessFiles(processId, updateArgs.files);
        if (errors !== null) {
            return {error: errors};
        }
    }

    if (updateArgs.samples.length) {
        let process = await r.table('processes').get(processId);
        let errors = await processCommon.updateProcessSamples(process, updateArgs.samples);
        if (errors !== null) {
            return {error: errors};
        }
    }

    if (updateArgs.name) {
        await r.table('processes').get(processId).update({name: updateArgs.name});
    }

    if (updateArgs.description) {
        await r.table('processes').get(processId).update({description: updateArgs.description});
    }

    return await getProcess(processId);
}

async function datasetsForProcess(processId) {
    let dataset2process = await r.table('dataset2process').filter({process_id: processId}).coerceTo('array');
    if (dataset2process.length === 0) {
        return [];
    }
    let datasetIdValues = dataset2process.map(record => record.dataset_id);
    return await r.expr(datasetIdValues).map(r.db('materialscommons').table('datasets').get(r.row)).coerceTo('array');
}

async function quickDeleteProcess(projectId, processId) {
    const isLeaf = await isLeafNode(processId);
    if (!isLeaf) {
        return {error: `Process ${processId} is not a leaf node`};
    }

    let experiments = await processExperiments(processId);
    if (experiments.length > 1) {
        return {error: `Process is in multiple experiments`};
    }

    let process = await getProcess(processId);
    process = process.val;

    // Note: deleting a process implies that it is deleted from ALL experiments!
    await r.table('project2process').getAll([projectId, processId], {index: 'project_process'}).delete();
    await r.table('experiment2process').getAll(processId, {index: 'process_id'}).delete();

    let process2sampleout = await r.table('process2sample').getAll(processId, {index: 'process_id'})
        .filter({direction: 'out'});
    await r.table('process2sample').getAll(processId, {index: 'process_id'}).delete();
    if (process.does_transform) {
        let samplePropertySets = process2sampleout.map(p2s => [p2s.sample_id, p2s.property_set_id]);
        await r.table('sample2propertyset').getAll(r.args(samplePropertySets), {index: 'sample_property_set'}).delete();
    }

    if (process.process_type === 'create') {
        let projectSamples = process2sampleout.map(p2s => [projectId, p2s.sample_id]);
        await r.table('project2sample').getAll(r.args(projectSamples), {index: 'project_sample'}).delete();

        // Delete samples from experiments
        let sampleIds = process2sampleout.map(p2s => p2s.sample_id);
        await r.table('experiment2sample').getAll(r.args(sampleIds), {index: 'sample_id'}).delete();
    }

    if (process2sampleout.length) {
        let toInsert = process2sampleout.map(p2s => ({
            project_id: projectId,
            process_id: processId,
            sample_id: p2s.sample_id,
            property_set_id: p2s.property_set_id
        }));
        await r.table('deletedprocesses').insert(toInsert);
    } else {
        await r.table('deletedprocesses').insert({
            project_id: projectId,
            process_id: processId,
            sample_id: '',
            property_set_id: ''
        });
    }

    return {val: {action: 'deleted', id: processId}};
}

async function isLeafNode(processId) {
    // can not delete a process that is a non-leaf node in a workflow;
    // a process is a non-leaf node if it has any 'out' sample that is an 'in' sample elsewhere
    let outputSamples = await r.table('process2sample').getAll(processId, {index: 'process_id'})
        .filter({direction: 'out'});
    if (!outputSamples.length) {
        // no output samples, so must be a leaf node
        return true;
    }
    let samplePropSetPairs = outputSamples.map(e => [e.sample_id, e.property_set_id]);
    let usingAsInputs = await r.table('process2sample')
        .getAll(r.args(samplePropSetPairs), {index: 'sample_property_set'})
        .filter({direction: 'in'});
    // If length is zero then process is a leaf node
    return usingAsInputs.length === 0;
}

async function addAdditionalParemeters(processId, args) {
    //get new setup
    let rv = await r.table('setups').insert(new model.Setups('Process', 'process'));
    let setupId = rv.generated_keys[0];
    let properties = args.map(prop => {
        if (!prop.description) prop.description = '';
        if (!prop.unit) prop.unit = '';
        return new model.SetupProperty(
            setupId, prop.name, prop.description,
            prop.attribute, prop.otype, prop.value, prop.unit);
    });
    await r.table('setupproperties').insert(properties);
    await r.table('process2setup').insert(new model.Process2Setup(processId, setupId));
    return {val: await getProcess(processId)};
}

async function deleteProcessFull(projectId, processId, options) {
    let forceDelete = false;
    if (options && options.force) forceDelete = true;

    let i;

    if (!forceDelete) {
        // can not delete a process that is in a dataset
        let dataset2process = await r.table('dataset2process').getAll(processId, {index: 'process_id'});
        if (dataset2process.length > 0) {
            return {error: "Can not delete a process that is in a dataset: remove process from dataset(s)"}
        }

        // can not delete a process that is a non-leaf node in a workflow;
        // a process is a non-leaf node if it has any 'out' sample that is an 'in' sample elsewhere
        let outputSamples = await r.table('process2sample').getAll(processId, {index: 'process_id'})
            .filter({direction: 'out'});
        let samplePropSetPairs = outputSamples.map(e => [e.sample_id, e.property_set_id]);
        let usingAsInputs = await r.table('process2sample')
            .getAll(r.args(samplePropSetPairs), {index: 'sample_property_set'})
            .filter({direction: 'in'});
        if (usingAsInputs.length) {
            return {
                error: `Can not delete a process, ${processId}, that is not the leaf node of a workflow; delete other processes first`
            }
        }
    }

    try {
        // remove project2process records with projectId, and processId
        await r.table('project2process').getAll([projectId, processId], {index: 'project_process'}).delete();

        // if other records with processId exist, then there are other projects using the process, done!
        let project2processOther = await r.table('project2process').filter({process_id: processId});
        if (project2processOther.length === 0) {
            // remove experiment2process records with processId
            await r.table('experiment2process').filter({process_id: processId}).delete();

            // remove process2file records with processId
            await r.table('process2file').filter({process_id: processId}).delete();

            // remove experimentTask2Process records with processId
            //   for each such experimentTask, if there are no other records, delete experimentsTasks
            let experimenttask2process = await r.table('experimenttask2process').filter({process_id: processId});
            let experimentTaskIdValues = experimenttask2process.map(record => record.experimentaltask_id);
            await r.table('experimenttask2process').filter({process_id: processId}).delete();
            if (experimentTaskIdValues) {
                for (i = 0; i < experimentTaskIdValues.length; i++) {
                    let id = experimentTaskIdValues[i];
                    let hits = await r.table('experimenttask2process').filter({experimentaltask_id: id});
                    if (!hits || (hits && (hits.length === 0))) {
                        await r.table('experimenttasks').get(id).delete();
                    }
                }
            }

            // remove process2measurement records
            //   for each such measurement, if there are no other records, delete measurement
            let process2measurement = await r.table('process2measurement').filter({process_id: processId});
            let measurementIdValues = process2measurement.map(record => record.measurement_id);
            await r.table('process2measurement').filter({process_id: processId}).delete();
            if (measurementIdValues) {
                for (i = 0; i < measurementIdValues.length; i++) {
                    let id = measurementIdValues[i];
                    let hits = await r.table('process2measurement').filter({measurement_id: id});
                    if (!hits || (hits && (hits.length === 0))) {
                        await r.table('measurements').get(id).delete();
                    }
                }
            }

            // remote process2Sample records with processId
            //   for each such sample, if there are no other records, delete sample
            let process2Sample = await r.table('process2sample').filter({process_id: processId});
            let sampleIdValues = process2Sample.map(record => record.sample_id);
            await r.table('process2sample').filter({process_id: processId}).delete();
            if (sampleIdValues) {
                for (i = 0; i < sampleIdValues.length; i++) {
                    let id = sampleIdValues[i];
                    let hits = await r.table('process2sample').filter({sample_id: id});
                    if (!hits || (hits && (hits.length === 0))) {
                        await r.table('samples').get(id).delete();
                    }
                }
            }

            // remove process2setup records and all setups so linked
            let process2setup = await r.table('process2setup').filter({process_id: processId});
            let setupIdValues = process2setup.map(record => record.setup_id);
            if (setupIdValues) {
                for (i = 0; i < setupIdValues.length; i++) {
                    let id = setupIdValues[i];
                    await r.table('setups').get(id).delete();
                }
            }
        }
    } catch (error) {
        return {error: error};
    }

    return {val: {action: 'deleted', id: processId}};
}

async function createProcessTemplate(template, owner) {
    let rv = {};

    template.owner = owner;

    let results = await r.table('templates').insert(template);
    if (results.errors) {
        rv.error = `Template ${template.id} already exists`;
    } else {
        rv.val = await getTemplate(template.id);
    }
    return rv;
}

async function updateExistingTemplate(template_id, template) {
    let rv = {};
    await r.table('templates').get(template_id).update(template);
    rv.val = await getTemplate(template_id);
    return rv;
}

async function processExperiments(processId) {
    return await r.table('experiment2process').getAll(processId, {index: 'process_id'})
        .eqJoin('experiment_id', r.table('experiments')).zip();
}

async function processFiles(processId) {
    let rv = {};
    rv.val = await r.table('process2file').getAll(processId, {index: 'process_id'})
        .eqJoin('datafile_id', r.table('datafiles')).zip()
        .merge(f => {
            return {
                samples: r.table('sample2datafile').getAll(f('id'), {index: 'datafile_id'})
                    .eqJoin('sample_id', r.table('samples')).zip()
                    .distinct().coerceTo('array')
            };
        });
    return rv;
}

module.exports = {
    getProcess,
    getProjectProcesses,
    getProcessTemplates,
    addAdditionalParemeters,
    createProcessFromTemplate,
    updateProcess,
    deleteProcessFull,
    quickDeleteProcess,
    deleteProcess: quickDeleteProcess, // alias deleteProcess to quickDeleteProcess for now.
    datasetsForProcess,
    getTemplate,
    createProcessTemplate,
    updateExistingTemplate,
    isLeafNode,
    processExperiments,
    processFiles
};
