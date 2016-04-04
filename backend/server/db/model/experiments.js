module.exports = function(r) {
    const dbExec = require('./run');
    const db = require('./db')(r);
    const model = require('./model')(r);

    return {
        getAllForProject,
        get,
        create,
        experimentExistsInProject
    };

    function* getAllForProject(projectID) {
        let rql = r.table('project2experiment').getAll(projectID, {index: 'project_id'})
            .eqJoin('experiment_id', r.table('experiments')).zip()
            .merge((experiment) => {
                return {
                    steps: r.table('experiment2experiment_step')
                        .getAll(experiment('id'), {index: 'experiment_id'})
                        .eqJoin('experiment_step_id', r.table('experiment_steps')).zip()
                        .filter({parent: ''})
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
                        .filter({parent: ''})
                        .coerceTo('array')
                }
            });
        let experiment = yield dbExec(rql);
        return {val: experiment};
    }

    function* create(experiment, owner) {
        let e = new model.Experiment(experiment.name, owner);
        e.description = experiment.description;
        e.aim = experiment.aim;
        e.goal = experiment.goal;
        e.status = experiment.status;
        let newExperiment = yield db.insert('experiments', e);
        let proj2experiment = new model.Project2Experiment(experiment.project_id, newExperiment.id);
        yield db.insert('project2experiment', proj2experiment);
        return {val: newExperiment};
    }

    function* experimentExistsInProject(projectID, experimentID) {
        console.log('experimentExistsInProject');
        let rql = r.table('project2experiment').getAll([projectID, experimentID], {index: 'project_experiment'});
        let matches = yield dbExec(rql);
        return matches.length !== 0;
    }
};
