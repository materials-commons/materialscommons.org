module.exports = function(r) {
    const dbExec = require('./run');
    const db = require('./db')(r);
    const model = require('./model')(r);
    const commonQueries = require('./common-queries');
    const processCommon = require('./process-common')(r);
    const _ = require('lodash');

    return {
        getAllForProject,
        get,
        create,
        update,
        createTask,
        getTask,
        updateTask,
        experimentExistsInProject,
        experimentTaskExistsInExperiment,
        experimentNoteExistsInExperiment,
        deleteTask,
        taskIsUsingProcess,
        getExperimentNote,
        createExperimentNote,
        updateExperimentNote,
        deleteExperimentNote,
        templateExists,
        addTemplateToTask,
        updateTaskTemplate,
        isTemplateForTask,
        isTemplateForProcess,
        getTemplate,
        addSamples,
        deleteSamplesFromExperiment,
        allSamplesInExperiment,
        allFilesInExperiment,
        allProcessesInExperiment,
        sampleInExperiment,
        fileInProject,
        getProcessesForExperiment,
        getFilesForExperiment,
        experimentHasDataset,
        taskProcessIsUnused,
        addProcessFromTemplate,
        updateProcess
    };

    function* getAllForProject(projectID) {
        let rql = r.table('project2experiment').getAll(projectID, {index: 'project_id'})
            .eqJoin('experiment_id', r.table('experiments')).zip()
            .merge((experiment) => {
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
                        .orderBy('name')
                        .coerceTo('array'),
                    files: r.table('experiment2datafile').getAll(experiment('id'), {index: 'experiment_id'})
                        .eqJoin('datafile_id', r.table('datafiles')).zip()
                        .orderBy('name')
                        .coerceTo('array'),
                    processes: r.table('experiment2process').getAll(experiment('id'), {index: 'experiment_id'})
                        .eqJoin('process_id', r.table('processes')).zip()
                        .orderBy('name')
                        .coerceTo('array'),
                    datasets: r.table('experiment2dataset').getAll(experiment('id'), {index: 'experiment_id'})
                        .eqJoin('dataset_id', r.table('datasets')).zip()
                        .orderBy('title')
                        .coerceTo('array')
                }
            });
        let experiments = yield dbExec(rql);
        return {val: experiments};
    }

    // Get assumes that validating the experiment for the project has already occured.
    function* get(experimentID) {
        let rql = r.table('experiments').get(experimentID)
            .merge((experiment) => {
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
                        .coerceTo('array')
                }
            });
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

    function* experimentExistsInProject(projectID, experimentID) {
        let rql = r.table('project2experiment').getAll([projectID, experimentID], {index: 'project_experiment'});
        let matches = yield dbExec(rql);
        return matches.length !== 0;
    }

    function* experimentTaskExistsInExperiment(experimentID, experimentTaskID) {
        let rql = r.table('experiment2experimenttask')
            .getAll([experimentID, experimentTaskID], {index: 'experiment_experiment_task'});
        let matches = yield dbExec(rql);
        return matches.length !== 0;
    }

    function* experimentNoteExistsInExperiment(experimentID, experimentNoteID) {
        let rql = r.table('experiment2experimentnote')
            .getAll([experimentID, experimentNoteID], {index: 'experiment_experiment_note'});
        let matches = yield dbExec(rql);
        return matches.length !== 0;
    }

    function* deleteTask(experimentID, taskID) {
        yield r.table('experiment2experimenttask').getAll([experimentID, taskID]).delete();
        let old = yield r.table('experimenttasks').get(taskID).delete({returnChanges: true});
        let oldParentID = old.changes[0].old_val.parent_id;
        let oldIndex = old.changes[0].old_val.index;
        yield updateTasksAboveDeleted(experimentID, oldParentID, oldIndex);
        if (old.process_id) {
            yield deleteProcess(experimentID, old.process_id);
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

    function* taskIsUsingProcess(taskID) {
        let rql = r.table('experimenttasks').get(taskID);
        let task = yield dbExec(rql);
        return task.process_id !== '';
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

    function* templateExists(templateId) {
        let rql = r.table('templates').getAll(templateId);
        let matches = yield dbExec(rql);
        return matches.length !== 0;
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
        return yield processCommon.getProcess(procId);
    }

    function* updateProcess(experimentId, processId, properties, files, samples) {
        let errors = yield updateTemplateCommon(experimentId, processId, properties, files, samples);

        if (errors !== null) {
            return errors;
        }

        return yield processCommon.getProcess(processId);
    }

    function* updateTaskTemplate(experimentId, processId, properties, files, samples) {
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
            var byFileID = _.indexBy(matchingEntries, 'datafile_id');
            return files.filter(f => (!(f.datafile_id in byFileID)));
        }

        return files;
    }

    function* removeExistingExperimentSampleEntries(experimentId, samples) {
        if (samples.length) {
            let indexEntries = samples.map(s => [experimentId, s.sample_id]);
            let matchingEntries = yield r.table('experiment2sample').getAll(r.args(indexEntries), {index: 'experiment_sample'});
            var bySampleID = _.indexBy(matchingEntries, 'sample_id');
            return samples.filter(s => (!(s.sample_id in bySampleID)));
        }

        return samples;
    }

    function* isTemplateForTask(templateId, taskId) {
        let rql = r.table('experimenttasks').get(taskId);
        let task = yield dbExec(rql);
        return task.template_id === templateId;
    }

    function* isTemplateForProcess(templateId, processId) {
        let process = yield r.table('processes').get(processId);
        return process.template_id === templateId;
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
        let processSamplesToDelete = sampleIds.map((sampleId) => [processId, sampleId]);
        yield r.table('process2sample').getAll(r.args(processSamplesToDelete), {index: 'process_sample'}).delete();

        let experimentSamplesToDelete = sampleIds.map((sampleId) => [experimentId, sampleId]);
        yield r.table('experiment2sample').getAll(r.args(experimentSamplesToDelete), {index: 'experiment_sample'}).delete();
        return {val: sampleIds};
    }

    function* allSamplesInExperiment(experimentId, sampleIds) {
        let indexArgs = sampleIds.map((sampleId) => [experimentId, sampleId]);
        let samples = yield r.table('experiment2sample').getAll(r.args(indexArgs), {index: 'experiment_sample'});
        return samples.length === sampleIds.length;
    }

    function* allFilesInExperiment(experimentId, fileIds) {
        let indexArgs = fileIds.map((fileId) => [experimentId, fileId]);
        let files = yield r.table('experiment2datafile').getAll(r.args(indexArgs), {index: 'experiment_datafile'});
        return files.length === fileIds.length;
    }

    function* allProcessesInExperiment(experimentId, processIds) {
        let indexArgs = processIds.map((id) => [experimentId, id]);
        let processes = yield r.table('experiment2process').getAll(r.args(indexArgs), {index: 'experiment_process'});
        return processes.length === processIds.length;
    }

    function* sampleInExperiment(experimentId, sampleId) {
        let samples = yield r.table('experiment2sample').getAll([experimentId, sampleId], {index: 'experiment_sample'});
        return samples.length !== 0;
    }

    function* fileInProject(fileId, projectId) {
        let files = yield r.table('project2datafile').getAll([projectId, fileId], {index: 'project_datafile'});
        return files.length !== 0;
    }

    function* getProcessesForExperiment(experimentId) {
        let rql = commonQueries.processDetailsRql(r.table('experiment2process').getAll(experimentId, {index: 'experiment_id'})
            .eqJoin('process_id', r.table('processes')).zip(), r);
        let processes = yield dbExec(rql);
        return {val: processes};
    }

    function* getFilesForExperiment(experimentId) {
        let rql = commonQueries.fileDetailsRql(r.table('experiment2datafile').getAll(experimentId, {index: 'experiment_id'})
            .eqJoin('datafile_id', r.table('datafiles')).zip(), r);
        let files = yield dbExec(rql);
        return {val: files};
    }

    function* experimentHasDataset(experimentId, datasetId) {
        let datasets = yield r.table('experiment2dataset').getAll([experimentId, datasetId], {index: 'experiment_dataset'});
        return datasets.length !== 0;
    }

    function* taskProcessIsUnused(taskId) {
        let task = yield r.table('experimenttasks').get(taskId);
        if (task.process_id === '') {
            return true;
        }

        return yield processCommon.processIsUnused(task.process_id);
    }
};
