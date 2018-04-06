const r = require('../r');
const dbExec = require('./run');
const db = require('./db');
const model = require('../../../shared/model');
const commonQueries = require('../../../lib/common-queries');
const processCommon = require('./process-common');
const sampleCommon = require('./sample-common');
const _ = require('lodash');
const processes = require('./processes');

function* getAllForProject(projectID) {
    let rql = r.table('project2experiment').getAll(projectID, {index: 'project_id'})
        .eqJoin('experiment_id', r.table('experiments')).zip();
    rql = addExperimentComputed(rql);
    let experiments = yield dbExec(rql);
    return {val: experiments};
}

function addExperimentComputed(rql) {
    rql = rql.merge((experiment) => {
        return {
            owner_details: r.table('users').get(experiment('owner')).pluck('fullname'),
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
function* get(experimentID) {
    let rql = r.table('experiments').get(experimentID);
    rql = addExperimentComputed(rql);
    let experiment = yield dbExec(rql);
    experiment.tasks.forEach((task) => task.tasks = []);
    return {val: experiment};
}

function* create(experiment, owner) {
    let e = new model.Experiment(experiment.name, owner);
    e.description = experiment.description;
    let newExperiment = yield db.insert('experiments', e);
    let proj2experiment = new model.Project2Experiment(experiment.project_id, newExperiment.id);
    yield db.insert('project2experiment', proj2experiment);
    let etask = new model.ExperimentTask('', owner);
    yield createTask(newExperiment.id, etask, owner);
    return yield get(newExperiment.id);
}

function* update(experimentID, updateArgs) {
    yield db.update('experiments', experimentID, updateArgs);
    return yield get(experimentID);
}

function* merge(projectId, mergeArgs, owner) {
    let e = {
        name: mergeArgs.name,
        description: mergeArgs.description,
        project_id: projectId
    };
    let rv = yield create(e, owner);
    let mergeToId = rv.val.id;
    yield insertUniqueEntriesIntoExperimentTable('experiment2sample', mergeToId, mergeArgs.experiments, 'sample_id');
    yield insertUniqueEntriesIntoExperimentTable('experiment2process', mergeToId, mergeArgs.experiments, 'process_id');
    yield insertUniqueEntriesIntoExperimentTable('experiment2datafile', mergeToId, mergeArgs.experiments, 'datafile_id');
    return yield get(mergeToId);
}

function* insertUniqueEntriesIntoExperimentTable(table, experimentIdToInsertTo, experimentIds, member) {
    let uniqIds = yield getUniqueForExperimentTable(table, experimentIds, member);
    yield insertIntoExperimentTable(table, experimentIdToInsertTo, uniqIds, member);
}

function* getUniqueForExperimentTable(table, experimentIds, member) {
    let entries = yield r.table(table).getAll(r.args(experimentIds), {index: 'experiment_id'});
    return _.uniq(entries.map(entry => entry[member]))
}

function* insertIntoExperimentTable(table, experimentId, ids, member) {
    let entriesToInsert = ids.map(id => {
        let entry = {
            experiment_id: experimentId,
        };
        entry[member] = id;
        return entry;
    });
    yield r.table(table).insert(entriesToInsert);
}

function* createTask(experimentID, task, owner) {
    let etask = new model.ExperimentTask(task.name, owner);
    if (task.note !== '') {
        etask.note = task.note;
    }
    etask.parent_id = task.parent_id;
    etask.index = task.index;
    yield updateIndexOfAllAffected(experimentID, task.parent_id, task.index);
    let createdTask = yield db.insert('experimenttasks', etask);
    let e2etask = new model.Experiment2ExperimentTask(experimentID, createdTask.id);
    yield db.insert('experiment2experimenttask', e2etask);
    return yield getTask(createdTask.id);
}

function* updateIndexOfAllAffected(experimentID, parentID, index) {
    let rql = r.table('experiment2experimenttask')
        .getAll(experimentID, {index: 'experiment_id'})
        .eqJoin('experiment_task_id', r.table('experimenttasks')).zip()
        .filter({parent_id: parentID})
        .filter(r.row('index').ge(index));

    let matchingTasks = yield dbExec(rql);
    let itemsToChange = matchingTasks.map((t) => {
        return {id: t.id, index: t.index + 1};
    });
    let updateRql = r.table('experimenttasks').insert(itemsToChange, {conflict: 'update'});
    yield dbExec(updateRql);
}

function* getTask(taskID) {
    let rql = r.table('experimenttasks').get(taskID)
        .merge((task) => {
            return {
                processes: r.table('experimenttask2process').getAll(task('id'), {index: 'experiment_task_id'})
                    .eqJoin('process_id', r.table('processes')).zip().coerceTo('array'),
                tasks: r.table('experimenttasks').getAll(task('id'), {index: 'parent_id'}).coerceTo('array')
            }
        });
    let t = yield dbExec(rql);

    // merge processes into tasks and then remove the entry
    t.tasks.concat(t.processes);
    delete t.processes;

    return {val: t};
}

function* updateTask(taskID, updateArgs) {
    let task = yield r.table('experimenttasks').get(taskID);
    if (updateArgs.swap) {
        let swapTask = yield r.table('experimenttasks').get(updateArgs.swap.task_id);
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
        yield dbExec(updateRql);
    }
    yield db.update('experimenttasks', taskID, updateArgs);
    if (task.process_id) {
        let processUpdates = {};
        if (updateArgs.name) {
            processUpdates.name = updateArgs.name;
        }
        if (updateArgs.note) {
            processUpdates.note = updateArgs.note;
        }
        if (processUpdates.name || processUpdates.note) {
            yield r.table('processes').get(task.process_id).update(processUpdates);
        }
    }
    return yield getTask(taskID);
}

function* deleteTask(experimentID, taskID) {
    yield r.table('experiment2experimenttask').getAll([experimentID, taskID]).delete();
    let old = yield r.table('experimenttasks').get(taskID).delete({returnChanges: true});
    let oldParentID = old.changes[0].old_val.parent_id;
    let oldIndex = old.changes[0].old_val.index;
    yield updateTasksAboveDeleted(experimentID, oldParentID, oldIndex);
    if (old.process_id) {
        yield quickDeleteExperimentProcess(experimentID, old.process_id);
    }
    return {val: old.changes[0].old_val};
}

function* deleteProcess(experimentId, processId) {
    let process2setupEntries = yield r.table('process2setup').getAll(r.args(processId), {index: 'process_id'});
    let setupIds = process2setupEntries.map(e => e.setup_id);
    yield r.table('processes').get(processId).delete();
    yield r.table('setups').getAll(r.args(setupIds)).delete();
    yield r.table('setupproperties').getAll(r.args(setupIds), {index: 'setup_id'}).delete();
    yield r.table('process2setup').getAll(processId, {index: 'process_id'}).delete();
    yield r.table('experiment2process').getAll([experimentId, processId], {index: 'experiment_process'}).delete();
}

function* updateTasksAboveDeleted(experimentID, parentID, index) {
    let rql = r.table('experiment2experimenttask')
        .getAll(experimentID, {index: 'experiment_id'})
        .eqJoin('experiment_task_id', r.table('experimenttasks')).zip()
        .filter({parent_id: parentID})
        .filter(r.row('index').ge(index));

    let matchingTasks = yield dbExec(rql);
    let itemsToChange = matchingTasks.map((t) => {
        return {id: t.id, index: t.index - 1};
    });
    let updateRql = r.table('experimenttasks').insert(itemsToChange, {conflict: 'update'});
    yield dbExec(updateRql);
}

function* getExperimentNote(noteID) {
    let rql = r.table('experimentnotes').get(noteID);
    let note = yield dbExec(rql);
    return {val: note};
}

function* createExperimentNote(experimentID, user, noteArgs) {
    let note = new model.ExperimentNote(noteArgs.name, noteArgs.note, user);
    let created = yield db.insert('experimentnotes', note);
    let e2en = new model.Experiment2ExperimentNote(experimentID, created.id);
    yield db.insert('experiment2experimentnote', e2en);
    return {val: created};
}

function* updateExperimentNote(noteID, noteArgs) {
    yield r.table('experimentnotes').get(noteID).update(noteArgs);
    return yield getExperimentNote(noteID);
}

function* deleteExperimentNote(experimentID, noteID) {
    yield r.table('experiment2experimentnote')
        .getAll([experimentID, noteID], {index: 'experiment_experiment_note'}).delete();
    let old = yield r.table('experimentnotes').get(noteID).delete({returnChanges: true});
    return {val: old.changes[0].old_val};
}

function* addTemplateToTask(projectId, experimentId, taskId, templateId, owner) {
    let template = yield r.table('templates').get(templateId);
    let procId = yield processCommon.createProcessFromTemplate(projectId, template, owner);
    let templateName = templateId.substring(7);
    yield r.table('experimenttasks').get(taskId).update({
        process_id: procId,
        template_name: templateName,
        template_id: templateId
    });
    let e2proc = new model.Experiment2Process(experimentId, procId);
    yield r.table('experiment2process').insert(e2proc);
    return yield getTask(taskId);
}

function* addProcessFromTemplate(projectId, experimentId, templateId, owner) {
    let template = yield r.table('templates').get(templateId);
    let procId = yield processCommon.createProcessFromTemplate(projectId, template, owner);
    let e2proc = new model.Experiment2Process(experimentId, procId);
    yield r.table('experiment2process').insert(e2proc);
    return yield processCommon.getProcess(r, procId);
}

function* cloneProcess(projectId, experimentId, processId, owner, cloneArgs) {
    let process = yield processCommon.getProcess(r, processId);
    process = process.val;
    let createdProcess = yield addProcessFromTemplate(projectId, experimentId, process.template_id, owner);
    createdProcess = createdProcess.val;

    // Adding input samples will take care of output samples for transformation processes.
    let samples = cloneArgs.samples.map(s => ({command: 'add', id: s.id, property_set_id: s.property_set_id}));
    yield processCommon.updateProcessSamples(createdProcess, samples);

    // Add files
    let files = cloneArgs.files.map(f => ({command: 'add', id: f.id}));
    yield processCommon.updateProcessFiles(createdProcess.id, files);

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
        yield processCommon.updateProperties(createdProcess.setup[sIndex].properties);
    }

    if (cloneArgs.name && cloneArgs.name !== '') {
        yield r.table('processes').get(createdProcess.id).update({name: cloneArgs.name});
    }

    // TODO: Add measurements

    return yield processCommon.getProcess(r, createdProcess.id);
}

function* updateProcess(experimentId, processId, properties, files, samples) {
    let errors = yield updateTemplateCommon(experimentId, processId, properties, files, samples);

    if (errors !== null) {
        return errors;
    }

    return yield processCommon.getProcess(r, processId);
}

function* updateTaskTemplate(taskId, experimentId, processId, properties, files, samples) {
    let errors = yield updateTemplateCommon(experimentId, processId, properties, files, samples);

    if (errors !== null) {
        return errors;
    }

    if (processId) {
        let task = yield r.table('experimenttasks').get(taskId);
        yield r.table('processes').get(processId).update({name: task.name});
    }

    return yield getTask(taskId);
}

function* updateTemplateCommon(experimentId, processId, properties, files, samples) {
    if (properties) {
        let errors = yield processCommon.updateProperties(properties);
        if (errors !== null) {
            return {error: errors};
        }
    }

    let process = null;

    if (processId) {
        process = yield r.table('processes').get(processId);
    }

    if (files) {
        let errors = yield processCommon.updateProcessFiles(processId, files);
        if (errors !== null) {
            return {error: errors};
        }

        let filesToAddToExperiment = files.filter(f => f.command === 'add').map(f => new model.Experiment2DataFile(experimentId, f.id));
        filesToAddToExperiment = yield removeExistingExperimentFileEntries(experimentId, filesToAddToExperiment);
        if (filesToAddToExperiment.length) {
            yield r.table('experiment2datafile').insert(filesToAddToExperiment);
        }

        // TODO: Delete files from experiment if the file is not used in any process associated with experiment.
    }

    if (samples) {
        let errors = yield processCommon.updateProcessSamples(process, samples);
        if (errors !== null) {
            return {error: errors};
        }

        let samplesToAddToExperiment = samples.filter(s => s.command === 'add').map(s => new model.Experiment2Sample(experimentId, s.id));
        samplesToAddToExperiment = yield removeExistingExperimentSampleEntries(experimentId, samplesToAddToExperiment);
        if (samplesToAddToExperiment.length) {
            yield r.table('experiment2sample').insert(samplesToAddToExperiment);
        }

        // TODO: Delete samples from experiment if the sample is not used in any process associated with experiment.
    }

    return null;
}

function* removeExistingExperimentFileEntries(experimentId, files) {
    if (files.length) {
        let indexEntries = files.map(f => [experimentId, f.datafile_id]);
        let matchingEntries = yield r.table('experiment2datafile').getAll(r.args(indexEntries), {index: 'experiment_datafile'});
        const byFileID = _.keyBy(matchingEntries, 'datafile_id');
        return files.filter(f => (!(f.datafile_id in byFileID)));
    }

    return files;
}

function* removeExistingExperimentSampleEntries(experimentId, samples) {
    if (samples.length) {
        let indexEntries = samples.map(s => [experimentId, s.sample_id]);
        let matchingEntries = yield r.table('experiment2sample').getAll(r.args(indexEntries), {index: 'experiment_sample'});
        const bySampleID = _.keyBy(matchingEntries, 'sample_id');
        return samples.filter(s => (!(s.sample_id in bySampleID)));
    }

    return samples;
}

function* getTemplate(templateId) {
    let rql = r.table('templates').get(templateId);
    return yield dbExec(rql);
}

function* addSamples(experimentId, samples) {
    let samplesToAdd = samples.map((sampleId) => {
        return {experiment_id: experimentId, sample_id: sampleId};
    });
    yield r.table('experiment2sample').insert(samplesToAdd);
    return {val: samplesToAdd};
}

function* deleteSamplesFromExperiment(experimentId, processId, sampleIds) {
    let canDelete = yield sampleCommon.canDeleteSamples(sampleIds, processId);
    // If any samples are used in other processes then stop and return an error.
    if (!canDelete) {
        return {error: 'Some or all samples are used in other processes'};
    }

    let processSamplesToDelete = sampleIds.map((sampleId) => [processId, sampleId]);
    yield r.table('process2sample').getAll(r.args(processSamplesToDelete), {index: 'process_sample'}).delete();

    let experimentSamplesToDelete = sampleIds.map((sampleId) => [experimentId, sampleId]);
    yield r.table('experiment2sample').getAll(r.args(experimentSamplesToDelete), {index: 'experiment_sample'}).delete();

    yield sampleCommon.removeUnusedSamples(sampleIds);

    return {val: sampleIds};
}

function* getProcessesForExperiment(experimentId, simple) {
    let baseRql = r.table('experiment2process').getAll(experimentId, {index: 'experiment_id'})
        .eqJoin('process_id', r.table('processes')).zip();

    let rql = simple ? commonQueries.processDetailsSimpleRql(baseRql, r) : commonQueries.processDetailsRql(baseRql, r),
        processes = yield dbExec(rql);

    return {val: processes};
}

function* getFilesForExperiment(experimentId) {
    let rql = commonQueries.fileDetailsRql(r.table('experiment2datafile').getAll(experimentId, {index: 'experiment_id'})
        .eqJoin('datafile_id', r.table('datafiles')).zip(), r);
    let files = yield dbExec(rql);
    return {val: files};
}

function* quickDeleteExperimentProcess(projectId, experimentId, processId) {
    let experiments = yield processes.processExperiments(processId);
    if (experiments.length === 1) {
        yield processes.quickDeleteProcess(projectId, processId);
    }

    yield r.table('experiment2process').getAll([experimentId, processId], {index: 'experiment_process'}).delete();

    let experimentDatasets = yield r.table('experiment2dataset').getAll(experimentId, {index: 'experiment_id'});
    let datasetProcesses = experimentDatasets.map(ed => [ed.dataset_id, processId]);
    yield r.table('dataset2process').getAll(r.args(datasetProcesses), {index: 'dataset_process'}).delete();

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
