module.exports = function(r) {
    const dbExec = require('./run');
    const db = require('./db')(r);
    const model = require('./model')(r);

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
        deleteExperimentNote
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
        e.note = experiment.note;
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
        etask.note = task.note;
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
        let itemsToChange = matchingTasks.map((t) => { return {id: t.id, index: t.index + 1}; });
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
        let itemsToChange = matchingTasks.map((t) => { return {id: t.id, index: t.index - 1}; });
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
};
