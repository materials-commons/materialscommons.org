module.exports = function(r) {
    const dbExec = require('./run');
    const db = require('./db')(r);
    const model = require('./model')(r);
    const _ = require('lodash');
    const commonQueries = require('./common-queries');

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
        getTemplate,
        addSamples,
        deleteSamplesFromExperiment,
        allSamplesInExperiment,
        fileInProject,
        getProcessesForExperiment,
        getFilesForExperiment
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
        if (updateArgs.swap) {
            let task = yield r.table('experimenttasks').get(taskID);
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
        return {val: old.changes[0].old_val};
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
        let procId = yield createProcessFromTemplate(projectId, template, owner);
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

    function* createProcessFromTemplate(projectId, template, owner) {
        let p = new model.Process(template.name, owner, template.id, template.does_transform);
        // TODO: Fix ugly hack, template id is global_<name>, the substring removes the global_ part.
        p.template_name = template.id.substring(7);
        let proc = yield addProcess(projectId, p);
        yield createSetup(proc.id, template.setup);
        return proc.id;
    }

    // addProcess inserts the process and add it to the project.
    function* addProcess(projectID, process) {
        let p = yield db.insert('processes', process);
        let p2proc = new model.Project2Process(projectID, p.id);
        yield db.insert('project2process', p2proc);
        return p;
    }

    function* createSetup(processID, settings) {
        for (let i = 0; i < settings.length; i++) {
            let current = settings[i];

            // Create the setting
            let s = new model.Setups(current.name, current.attribute);
            let setup = yield db.insert('setups', s);

            // Associate it with the process
            let p2s = new model.Process2Setup(processID, setup.id);
            yield db.insert('process2setup', p2s);

            // Create each property for the setting. Add these to the
            // setting variable so we can return a setting object with
            // all of its properties.
            // TODO: Add into an array and then batch insert into setupproperties
            for (let j = 0; j < current.properties.length; j++) {
                let p = current.properties[j].property;
                let val = p.value;
                let prop = new model.SetupProperty(setup.id, p.name, p.description, p.attribute,
                    p._type, val, p.unit);
                yield db.insert('setupproperties', prop);
            }
        }
    }

    function* updateTaskTemplate(taskId, experimentId, properties, processId, files, samples) {
        if (properties) {
            let errors = yield updateTaskTemplateProperties(properties);
            if (errors !== null) {
                return {errors: errors};
            }
        }

        if (files) {
            let errors = yield updateTaskTemplateFiles(experimentId, processId, files);
            if (errors !== null) {
                return {errors: errors};
            }
        }

        if (samples) {
            let errors = yield updateTaskTemplateSamples(experimentId, processId, samples);
            if (errors !== null) {
                return {errors: errors};
            }
        }

        return yield getTask(taskId);
    }

    function* updateTaskTemplateProperties(properties) {
        // Validate that the retrieved property matches that we are updating
        let errors = [];
        for (let i = 0; i < properties.length; i++) {
            let property = properties[i];
            // getAll returns an array
            let existingPropertyMatches = yield r.table('setupproperties')
                .getAll([property.id, property.setup_id], {index: 'id_setup_id'});
            if (!existingPropertyMatches.length) {
                // Skip, bad property
                errors.push({error: `No matching property/setup ${property.id}.${property.setup_id}`});
                continue;
            }
            let existingProperty = existingPropertyMatches[0];
            if (existingProperty.attribute !== property.attribute) {
                errors.push({error: `Attributes don't match: ${property.id}/${property.attribute} doesn't match ${existingProperty.attribute}`});
            } else if (existingProperty._type !== property._type) {
                errors.push({error: `Types don't match: ${property.id}/${property._type} doesn't match ${existingProperty._type}`});
            } else {
                existingProperty.value = property.value;
                existingProperty.unit = property.unit;
                existingProperty.description = property.description;
                yield r.table('setupproperties').get(property.id).update(existingProperty);
            }
        }

        if (errors.length) {
            return {errors: errors};
        }

        return null;
    }

    function* updateTaskTemplateFiles(experimentId, processId, files) {
        let filesToAddToProcess = files.filter(f => f.command === 'add').map(f => new model.Process2File(processId, f.id, ''));
        filesToAddToProcess = yield removeExistingProcessFileEntries(processId, filesToAddToProcess);
        if (filesToAddToProcess.length) {
            yield r.table('process2file').insert(filesToAddToProcess);
        }

        let filesToDeleteFromProcess = files.filter(f => f.command === 'delete').map(f => [processId, f.id]);
        if (filesToDeleteFromProcess.length) {
            yield r.table('process2file').getAll(r.args(filesToDeleteFromProcess, {index: 'process_data'})).delete();
        }

        let filesToAddToExperiment = files.filter(f => f.command === 'add').map(f => new model.Experiment2DataFile(experimentId, f.id));
        filesToAddToExperiment = yield removeExistingExperimentFileEntries(experimentId, filesToAddToExperiment);
        if (filesToAddToExperiment.length) {
            yield r.table('experiment2datafile').insert(filesToAddToExperiment);
        }

        // TODO: Delete files from experiment if the file is not used in any process associated with experiment.

        return null;
    }

    function* removeExistingProcessFileEntries(processId, files) {
        if (files.length) {
            let indexEntries = files.map(f => [processId, f.datafile_id]);
            let matchingEntries = yield r.table('process2file').getAll(r.args(indexEntries), {index: 'process_datafile'});
            var byFileID = _.indexBy(matchingEntries, 'datafile_id');
            return files.filter(f => (!(f.datafile_id in byFileID)));
        }

        return files;
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

    function* updateTaskTemplateSamples(experimentId, processId, samples) {
        let samplesToAddToProcess = samples.filter(s => s.command === 'add').map(s => new model.Process2Sample(processId, s.id, s.property_set_id, ''));
        samplesToAddToProcess = yield removeExistingProcessSampleEntries(processId, samplesToAddToProcess);
        if (samplesToAddToProcess.length) {
            yield r.table('process2sample').insert(samplesToAddToProcess);
        }

        let samplesToDeleteFromProcess = samples.filter(s => s.command === 'delete').map(s => [processId, s.id, s.property_set_id]);
        if (samplesToDeleteFromProcess.length) {
            yield r.table('process2sample').getAll(r.args(samplesToDeleteFromProcess, {index: 'process_sample'})).delete();
        }

        let samplesToAddToExperiment = samples.filter(s => s.command === 'add').map(s => new model.Experiment2Sample(experimentId, s.id));
        samplesToAddToExperiment = yield removeExistingExperimentSampleEntries(experimentId, samplesToAddToExperiment);
        if (samplesToAddToExperiment.length) {
            yield r.table('experiment2sample').insert(samplesToAddToExperiment);
        }

        // TODO: Delete samples from experiment if the sample is not used in any process associated with experiment.

        return null;
    }

    function* removeExistingProcessSampleEntries(processId, samples) {
        if (samples.length) {
            let indexEntries = samples.map(s => [processId, s.sample_id, s.property_set_id]);
            let matchingEntries = yield r.table('process2sample').getAll(r.args(indexEntries), {index: 'process_sample_property_set'});
            var bySampleID = _.indexBy(matchingEntries, 'sample_id');
            return samples.filter(s => (!(s.sample_id in bySampleID)));
        }

        return samples;
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
};
