const r = require('../r');
const dbExec = require('./run');
const db = require('./db');
const model = require('./model');
const commonQueries = require('../queries/common-queries');
const processCommon = require('./process-common');
const sampleCommon = require('./sample-common');
const _ = require('lodash');
const processes = require('./processes');

async function getAllForProject(projectID) {
    let rql = r.table('project2experiment').getAll(projectID, {index: 'project_id'})
        .eqJoin('experiment_id', r.table('experiments')).zip();
    rql = addExperimentComputed(rql);
    let experiments = await dbExec(rql);
    return {val: experiments};
}

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

// Get assumes that validating the experiment for the project has already occured.
async function get(experimentID) {
    let rql = r.table('experiments').get(experimentID);
    rql = addExperimentComputed(rql);
    let experiment = await dbExec(rql);
    experiment.tasks.forEach((task) => task.tasks = []);
    return {val: experiment};
}

async function create(experiment, owner) {
    let e = new model.Experiment(experiment.name, owner);
    e.description = experiment.description;
    let newExperiment = await db.insert('experiments', e);
    let proj2experiment = new model.Project2Experiment(experiment.project_id, newExperiment.id);
    await db.insert('project2experiment', proj2experiment);
    let etask = new model.ExperimentTask('', owner);
    await createTask(newExperiment.id, etask, owner);
    return await get(newExperiment.id);
}

async function update(experimentID, updateArgs) {
    await db.update('experiments', experimentID, updateArgs);
    return await get(experimentID);
}

async function merge(projectId, mergeArgs, owner) {
    let e = {
        name: mergeArgs.name,
        description: mergeArgs.description,
        project_id: projectId
    };
    let rv = await create(e, owner);
    let mergeToId = rv.val.id;
    await insertUniqueEntriesIntoExperimentTable('experiment2sample', mergeToId, mergeArgs.experiments, 'sample_id');
    await insertUniqueEntriesIntoExperimentTable('experiment2process', mergeToId, mergeArgs.experiments, 'process_id');
    await insertUniqueEntriesIntoExperimentTable('experiment2datafile', mergeToId, mergeArgs.experiments, 'datafile_id');
    return await get(mergeToId);
}

async function insertUniqueEntriesIntoExperimentTable(table, experimentIdToInsertTo, experimentIds, member) {
    let uniqIds = await getUniqueForExperimentTable(table, experimentIds, member);
    await insertIntoExperimentTable(table, experimentIdToInsertTo, uniqIds, member);
}

async function getUniqueForExperimentTable(table, experimentIds, member) {
    let entries = await r.table(table).getAll(r.args(experimentIds), {index: 'experiment_id'});
    return _.uniq(entries.map(entry => entry[member]))
}

async function insertIntoExperimentTable(table, experimentId, ids, member) {
    let entriesToInsert = ids.map(id => {
        let entry = {
            experiment_id: experimentId,
        };
        entry[member] = id;
        return entry;
    });
    await r.table(table).insert(entriesToInsert);
}

async function createTask(experimentID, task, owner) {
    let etask = new model.ExperimentTask(task.name, owner);
    if (task.note !== '') {
        etask.note = task.note;
    }
    etask.parent_id = task.parent_id;
    etask.index = task.index;
    await updateIndexOfAllAffected(experimentID, task.parent_id, task.index);
    let createdTask = await db.insert('experimenttasks', etask);
    let e2etask = new model.Experiment2ExperimentTask(experimentID, createdTask.id);
    await db.insert('experiment2experimenttask', e2etask);
    return await getTask(createdTask.id);
}

async function updateIndexOfAllAffected(experimentID, parentID, index) {
    let rql = r.table('experiment2experimenttask')
        .getAll(experimentID, {index: 'experiment_id'})
        .eqJoin('experiment_task_id', r.table('experimenttasks')).zip()
        .filter({parent_id: parentID})
        .filter(r.row('index').ge(index));

    let matchingTasks = await dbExec(rql);
    let itemsToChange = matchingTasks.map((t) => {
        return {id: t.id, index: t.index + 1};
    });
    let updateRql = r.table('experimenttasks').insert(itemsToChange, {conflict: 'update'});
    await dbExec(updateRql);
}

async function getTask(taskID) {
    let rql = r.table('experimenttasks').get(taskID)
        .merge((task) => {
            return {
                processes: r.table('experimenttask2process').getAll(task('id'), {index: 'experiment_task_id'})
                    .eqJoin('process_id', r.table('processes')).zip().coerceTo('array'),
                tasks: r.table('experimenttasks').getAll(task('id'), {index: 'parent_id'}).coerceTo('array')
            }
        });
    let t = await dbExec(rql);

    // merge processes into tasks and then remove the entry
    t.tasks.concat(t.processes);
    delete t.processes;

    return {val: t};
}

async function updateTask(taskID, updateArgs) {
    let task = await r.table('experimenttasks').get(taskID);
    if (updateArgs.swap) {
        let swapTask = await r.table('experimenttasks').get(updateArgs.swap.task_id);
        if (swapTask.parent_id !== task.parent_id) {
            return {error: 'Tasks have different parents'};
        }
        let swapItems = [
            {
                id: taskID,
                index: swapTask.index
            },
            {
                id: updateArgs.swap.task_id,
                index: task.index
            }
        ];
        let updateRql = r.table('experimenttasks').insert(swapItems, {conflict: 'update'});
        await dbExec(updateRql);
    }
    await db.update('experimenttasks', taskID, updateArgs);
    if (task.process_id) {
        let processUpdates = {};
        if (updateArgs.name) {
            processUpdates.name = updateArgs.name;
        }
        if (updateArgs.note) {
            processUpdates.note = updateArgs.note;
        }
        if (processUpdates.name || processUpdates.note) {
            await r.table('processes').get(task.process_id).update(processUpdates);
        }
    }
    return await getTask(taskID);
}

async function deleteTask(experimentID, taskID) {
    await r.table('experiment2experimenttask').getAll([experimentID, taskID]).delete();
    let old = await r.table('experimenttasks').get(taskID).delete({returnChanges: true});
    let oldParentID = old.changes[0].old_val.parent_id;
    let oldIndex = old.changes[0].old_val.index;
    await updateTasksAboveDeleted(experimentID, oldParentID, oldIndex);
    if (old.process_id) {
        await quickDeleteExperimentProcess(experimentID, old.process_id);
    }
    return {val: old.changes[0].old_val};
}

async function deleteProcess(experimentId, processId) {
    let process2setupEntries = await r.table('process2setup').getAll(r.args(processId), {index: 'process_id'});
    let setupIds = process2setupEntries.map(e => e.setup_id);
    await r.table('processes').get(processId).delete();
    await r.table('setups').getAll(r.args(setupIds)).delete();
    await r.table('setupproperties').getAll(r.args(setupIds), {index: 'setup_id'}).delete();
    await r.table('process2setup').getAll(processId, {index: 'process_id'}).delete();
    await r.table('experiment2process').getAll([experimentId, processId], {index: 'experiment_process'}).delete();
}

async function updateTasksAboveDeleted(experimentID, parentID, index) {
    let rql = r.table('experiment2experimenttask')
        .getAll(experimentID, {index: 'experiment_id'})
        .eqJoin('experiment_task_id', r.table('experimenttasks')).zip()
        .filter({parent_id: parentID})
        .filter(r.row('index').ge(index));

    let matchingTasks = await dbExec(rql);
    let itemsToChange = matchingTasks.map((t) => {
        return {id: t.id, index: t.index - 1};
    });
    let updateRql = r.table('experimenttasks').insert(itemsToChange, {conflict: 'update'});
    await dbExec(updateRql);
}

async function getExperimentNote(noteID) {
    let rql = r.table('experimentnotes').get(noteID);
    let note = await dbExec(rql);
    return {val: note};
}

async function createExperimentNote(experimentID, user, noteArgs) {
    let note = new model.ExperimentNote(noteArgs.name, noteArgs.note, user);
    let created = await db.insert('experimentnotes', note);
    let e2en = new model.Experiment2ExperimentNote(experimentID, created.id);
    await db.insert('experiment2experimentnote', e2en);
    return {val: created};
}

async function updateExperimentNote(noteID, noteArgs) {
    await r.table('experimentnotes').get(noteID).update(noteArgs);
    return await getExperimentNote(noteID);
}

async function deleteExperimentNote(experimentID, noteID) {
    await r.table('experiment2experimentnote')
        .getAll([experimentID, noteID], {index: 'experiment_experiment_note'}).delete();
    let old = await r.table('experimentnotes').get(noteID).delete({returnChanges: true});
    return {val: old.changes[0].old_val};
}

async function addTemplateToTask(projectId, experimentId, taskId, templateId, owner) {
    let template = await r.table('templates').get(templateId);
    let procId = await processCommon.createProcessFromTemplate(projectId, template, owner);
    let templateName = templateId.substring(7);
    await r.table('experimenttasks').get(taskId).update({
        process_id: procId,
        template_name: templateName,
        template_id: templateId
    });
    let e2proc = new model.Experiment2Process(experimentId, procId);
    await r.table('experiment2process').insert(e2proc);
    return await getTask(taskId);
}

async function addProcessFromTemplate(projectId, experimentId, templateId, owner) {
    let template = await r.table('templates').get(templateId);
    let procId = await processCommon.createProcessFromTemplate(projectId, template, owner);
    let e2proc = new model.Experiment2Process(experimentId, procId);
    await r.table('experiment2process').insert(e2proc);
    return await processCommon.getProcess(r, procId);
}

async function cloneProcess(projectId, experimentId, processId, owner, cloneArgs) {
    let process = await processCommon.getProcess(r, processId);
    process = process.val;
    let createdProcess = await addProcessFromTemplate(projectId, experimentId, process.template_id, owner);
    createdProcess = createdProcess.val;

    // Adding input samples will take care of output samples for transformation processes.
    let samples = cloneArgs.samples.map(s => ({command: 'add', id: s.id, property_set_id: s.property_set_id}));
    await processCommon.updateProcessSamples(createdProcess, samples);

    // Add files
    let files = cloneArgs.files.map(f => ({command: 'add', id: f.id}));
    await processCommon.updateProcessFiles(createdProcess.id, files);

    // Add setup properties
    for (let sIndex = 0; sIndex < process.setup.length; sIndex++) {
        let properties = process.setup[sIndex].properties;
        let propMap = _.keyBy(createdProcess.setup[sIndex].properties, 'attribute');
        for (let pIndex = 0; pIndex < properties.length; pIndex++) {
            let prop = properties[pIndex];
            let cpProp = propMap[prop.attribute];
            cpProp.value = prop.value;
            cpProp.unit = prop.unit;
            cpProp.description = prop.description;
        }
        await processCommon.updateProperties(createdProcess.setup[sIndex].properties);
    }

    if (cloneArgs.name && cloneArgs.name !== '') {
        await r.table('processes').get(createdProcess.id).update({name: cloneArgs.name});
    }

    // TODO: Add measurements

    return await processCommon.getProcess(r, createdProcess.id);
}

async function updateProcess(experimentId, processId, properties, files, samples) {
    let errors = await updateTemplateCommon(experimentId, processId, properties, files, samples);

    if (errors !== null) {
        return errors;
    }

    return await processCommon.getProcess(r, processId);
}

async function updateTaskTemplate(taskId, experimentId, processId, properties, files, samples) {
    let errors = await updateTemplateCommon(experimentId, processId, properties, files, samples);

    if (errors !== null) {
        return errors;
    }

    if (processId) {
        let task = await r.table('experimenttasks').get(taskId);
        await r.table('processes').get(processId).update({name: task.name});
    }

    return await getTask(taskId);
}

async function updateTemplateCommon(experimentId, processId, properties, files, samples) {
    if (properties) {
        let errors = await processCommon.updateProperties(properties);
        if (errors !== null) {
            return {error: errors};
        }
    }

    let process = null;

    if (processId) {
        process = await r.table('processes').get(processId);
    }

    if (files) {
        let errors = await processCommon.updateProcessFiles(processId, files);
        if (errors !== null) {
            return {error: errors};
        }

        let filesToAddToExperiment = files.filter(f => f.command === 'add').map(f => new model.Experiment2DataFile(experimentId, f.id));
        filesToAddToExperiment = await removeExistingExperimentFileEntries(experimentId, filesToAddToExperiment);
        if (filesToAddToExperiment.length) {
            await r.table('experiment2datafile').insert(filesToAddToExperiment);
        }

        // TODO: Delete files from experiment if the file is not used in any process associated with experiment.
    }

    if (samples) {
        let errors = await processCommon.updateProcessSamples(process, samples);
        if (errors !== null) {
            return {error: errors};
        }

        let samplesToAddToExperiment = samples.filter(s => s.command === 'add').map(s => new model.Experiment2Sample(experimentId, s.id));
        samplesToAddToExperiment = await removeExistingExperimentSampleEntries(experimentId, samplesToAddToExperiment);
        if (samplesToAddToExperiment.length) {
            await r.table('experiment2sample').insert(samplesToAddToExperiment);
        }

        // TODO: Delete samples from experiment if the sample is not used in any process associated with experiment.
    }

    return null;
}

async function removeExistingExperimentFileEntries(experimentId, files) {
    if (files.length) {
        let indexEntries = files.map(f => [experimentId, f.datafile_id]);
        let matchingEntries = await r.table('experiment2datafile').getAll(r.args(indexEntries), {index: 'experiment_datafile'});
        const byFileID = _.keyBy(matchingEntries, 'datafile_id');
        return files.filter(f => (!(f.datafile_id in byFileID)));
    }

    return files;
}

async function removeExistingExperimentSampleEntries(experimentId, samples) {
    if (samples.length) {
        let indexEntries = samples.map(s => [experimentId, s.sample_id]);
        let matchingEntries = await r.table('experiment2sample').getAll(r.args(indexEntries), {index: 'experiment_sample'});
        const bySampleID = _.keyBy(matchingEntries, 'sample_id');
        return samples.filter(s => (!(s.sample_id in bySampleID)));
    }

    return samples;
}

async function getTemplate(templateId) {
    let rql = r.table('templates').get(templateId);
    return await dbExec(rql);
}

async function addSamples(experimentId, samples) {
    let samplesToAdd = samples.map((sampleId) => {
        return {experiment_id: experimentId, sample_id: sampleId};
    });
    await r.table('experiment2sample').insert(samplesToAdd);
    return {val: samplesToAdd};
}

async function deleteSamplesFromExperiment(experimentId, processId, sampleIds) {
    let canDelete = await sampleCommon.canDeleteSamples(sampleIds, processId);
    // If any samples are used in other processes then stop and return an error.
    if (!canDelete) {
        return {error: 'Some or all samples are used in other processes'};
    }

    let processSamplesToDelete = sampleIds.map((sampleId) => [processId, sampleId]);
    await r.table('process2sample').getAll(r.args(processSamplesToDelete), {index: 'process_sample'}).delete();

    let experimentSamplesToDelete = sampleIds.map((sampleId) => [experimentId, sampleId]);
    await r.table('experiment2sample').getAll(r.args(experimentSamplesToDelete), {index: 'experiment_sample'}).delete();

    await sampleCommon.removeUnusedSamples(sampleIds);

    return {val: sampleIds};
}

async function getProcessesForExperiment(experimentId, simple) {
    let baseRql = r.table('experiment2process').getAll(experimentId, {index: 'experiment_id'})
        .eqJoin('process_id', r.table('processes')).zip();

    let rql = simple ? commonQueries.processDetailsSimpleRql(baseRql, r) : commonQueries.processDetailsRql(baseRql, r),
        processes = await dbExec(rql);

    return {val: processes};
}

async function getFilesForExperiment(experimentId) {
    let rql = commonQueries.fileDetailsRql(r.table('experiment2datafile').getAll(experimentId, {index: 'experiment_id'})
        .eqJoin('datafile_id', r.table('datafiles')).zip(), r);
    let files = await dbExec(rql);
    return {val: files};
}

async function quickDeleteExperimentProcess(projectId, experimentId, processId) {
    let experiments = await processes.processExperiments(processId);
    if (experiments.length === 1) {
        await processes.quickDeleteProcess(projectId, processId);
    }

    await r.table('experiment2process').getAll([experimentId, processId], {index: 'experiment_process'}).delete();

    let experimentDatasets = await r.table('experiment2dataset').getAll(experimentId, {index: 'experiment_id'});
    let datasetProcesses = experimentDatasets.map(ed => [ed.dataset_id, processId]);
    await r.table('dataset2process').getAll(r.args(datasetProcesses), {index: 'dataset_process'}).delete();

    return true;
}

module.exports = {
    getAllForProject,
    get,
    create,
    update,
    createTask,
    getTask,
    updateTask,
    deleteTask,
    getExperimentNote,
    merge,
    createExperimentNote,
    updateExperimentNote,
    deleteExperimentNote,
    addTemplateToTask,
    updateTaskTemplate,
    getTemplate,
    addSamples,
    deleteSamplesFromExperiment,
    getProcessesForExperiment,
    getFilesForExperiment,
    addProcessFromTemplate,
    cloneProcess,
    updateProcess,
    quickDeleteExperimentProcess,
    addExperimentComputed
};
