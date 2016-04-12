module.exports = function(r) {
    const dbExec = require('./run');
    const db = require('./db')(r);
    const model = require('./model')(r);
    const _ = require('lodash');

    return {
        getAllForProject,
        get,
        create,
        update,
        createStep,
        getStep,
        updateStep,
        experimentExistsInProject,
        experimentStepExistsInExperiment,
        deleteStep,
        stepIsUsingProcess
    };

    function* getAllForProject(projectID) {
        let rql = r.table('project2experiment').getAll(projectID, {index: 'project_id'})
            .eqJoin('experiment_id', r.table('experiments')).zip()
            .merge((experiment) => {
                return {
                    steps: r.table('experiment2experiment_step')
                        .getAll(experiment('id'), {index: 'experiment_id'})
                        .eqJoin('experiment_step_id', r.table('experiment_steps')).zip()
                        .filter({parent_id: ''})
                        .orderBy('index')
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
                    steps: r.table('experiment2experiment_step')
                        .getAll(experiment('id'), {index: 'experiment_id'})
                        .eqJoin('experiment_step_id', r.table('experiment_steps')).zip()
                        .filter({parent_id: ''})
                        .orderBy('index')
                        .coerceTo('array')
                }
            });
        let experiment = yield dbExec(rql);
        experiment.steps.forEach((step) => step.steps = []);
        return {val: experiment};
    }

    function* create(experiment, owner) {
        let e = new model.Experiment(experiment.name, owner);
        e.description = experiment.description;
        let newExperiment = yield db.insert('experiments', e);
        let proj2experiment = new model.Project2Experiment(experiment.project_id, newExperiment.id);
        yield db.insert('project2experiment', proj2experiment);
        let estep = new model.ExperimentStep('', owner);
        yield createStep(newExperiment.id, estep, owner);
        return yield get(newExperiment.id);
    }

    function* update(experimentID, updateArgs) {
        yield db.update('experiments', experimentID, updateArgs);
        return yield get(experimentID);
    }

    function* createStep(experimentID, step, owner) {
        let estep = new model.ExperimentStep(step.name, owner);
        estep.description = step.description;
        estep.parent_id = step.parent_id;
        estep.index = step.index;
        yield updateIndexOfAllAffected(experimentID, step.parent_id, step.index);
        let createdStep = yield db.insert('experiment_steps', estep);
        let e2estep = new model.Experiment2ExperimentStep(experimentID, createdStep.id);
        yield db.insert('experiment2experiment_step', e2estep);
        return yield getStep(createdStep.id);
    }

    function* updateIndexOfAllAffected(experimentID, parentID, index) {
        let rql = r.table('experiment2experiment_step')
            .getAll(experimentID, {index: 'experiment_id'})
            .eqJoin('experiment_step_id', r.table('experiment_steps')).zip()
            .filter({parent_id: parentID})
            .filter(r.row('index').ge(index));

        let matchingSteps = yield dbExec(rql);
        let itemsToChange = matchingSteps.map((s) => { return {id: s.id, index: s.index + 1}; });
        let updateRql = r.table('experiment_steps').insert(itemsToChange, {conflict: 'update'});
        yield dbExec(updateRql);
    }

    function* getStep(stepID) {
        let rql = r.table('experiment_steps').get(stepID)
            .merge((step) => {
                return {
                    processes: r.table('experiment_step2process').getAll(step('id'), {index: 'experiment_step_id'})
                        .eqJoin('process_id', r.table('processes')).zip().coerceTo('array'),
                    steps: r.table('experiment_steps').getAll(step('id'), {index: 'parent_id'}).coerceTo('array')
                }
            });
        let s = yield dbExec(rql);

        // merge processes into steps and then remove the entry
        s.steps.concat(s.processes);
        delete s.processes;

        return {val: s};
    }

    function* updateStep(experimentID, stepID, updateArgs) {
        if (_.has(updateArgs, 'index')) {
            yield updateIndexOfAllAffected(experimentID, updateArgs.parent_id, updateArgs.index);
        }
        yield db.update('experiment_steps', stepID, updateArgs);
        return yield getStep(stepID);
    }

    function* experimentExistsInProject(projectID, experimentID) {
        let rql = r.table('project2experiment').getAll([projectID, experimentID], {index: 'project_experiment'});
        let matches = yield dbExec(rql);
        return matches.length !== 0;
    }

    function* experimentStepExistsInExperiment(experimentID, experimentStepID) {
        let rql = r.table('experiment2experiment_step')
            .getAll([experimentID, experimentStepID], {index: 'experiment_experiment_step'});
        let matches = yield dbExec(rql);
        return matches.length !== 0;
    }

    function* deleteStep(experimentID, stepID) {
        yield r.table('experiment2experiment_step').getAll([experimentID, stepID]).delete();
        let old = yield r.table('experiment_steps').get(stepID).delete({returnChanges: true});
        let oldParentID = old.changes[0].old_val.parent_id;
        let oldIndex = old.changes[0].old_val.index;
        yield updateStepsAboveDeleted(experimentID, oldParentID, oldIndex);
        return {val: old.changes[0].old_val};
    }

    function* updateStepsAboveDeleted(experimentID, parentID, index) {
        let rql = r.table('experiment2experiment_step')
            .getAll(experimentID, {index: 'experiment_id'})
            .eqJoin('experiment_step_id', r.table('experiment_steps')).zip()
            .filter({parent_id: parentID})
            .filter(r.row('index').ge(index));

        let matchingSteps = yield dbExec(rql);
        let itemsToChange = matchingSteps.map((s) => { return {id: s.id, index: s.index - 1}; });
        let updateRql = r.table('experiment_steps').insert(itemsToChange, {conflict: 'update'});
        yield dbExec(updateRql);
    }

    function* stepIsUsingProcess(stepID) {
        let rql = r.table('experiment_steps').get(stepID);
        let step = yield dbExec(rql);
        return step.process_id !== '';
    }
};
