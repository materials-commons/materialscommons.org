module.exports = function(r) {
    const dbExec = require('./run');
    const db = require('./db')(r);
    const model = require('./model')(r);

    return {
        getAllForProject,
        get,
        create,
        update,
        createStep,
        getStep,
        experimentExistsInProject,
        experimentStepExistsInExperiment
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
                        .coerceTo('array')
                }
            });
        let experiment = yield dbExec(rql);
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

    function* update(updateArgs, experimentID) {
        let steps = updateArgs.steps;
        delete updateArgs.steps;

        yield db.update('experiments', experimentID, updateArgs);
        if (steps.length) {
            console.log('going to update steps');
        }
    }

    function* createStep(experimentID, step, owner) {
        let estep = new model.ExperimentStep(step.name, owner);
        estep.description = step.description;
        estep.parent_id = step.parent_id;
        let createdStep = yield db.insert('experiment_steps', estep);
        console.log('createStep', createdStep);
        let e2estep = new model.Experiment2ExperimentStep(experimentID, createdStep.id);
        yield db.insert('experiment2experiment_step', e2estep);
        return yield getStep(createdStep.id);
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
};
