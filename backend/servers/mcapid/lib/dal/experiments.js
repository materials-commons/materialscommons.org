const model = require('@lib/model');


module.exports = function(r) {
    const db = require('./db')(r);

    async function createExperiment(name, description, owner, projectId) {
        let e = new model.Experiment(name, owner);
        e.description = description;
        let created = await db.insert('experiments', e);
        let p2e = new model.Project2Experiment(projectId, created.id);
        await db.insert('project2experiment', p2e);
        return await getExperiment(created.id);
    }

    async function getExperiment(experimentId) {
        return r.table('experiments').get(experimentId)
            .without('citations', 'collaborators', 'funding', 'goals', 'note', 'papers', 'project_id', 'publications')
            .merge(e => {
                return {
                    owner_details: r.table('users').get(e('owner')).pluck('fullname'),
                    files_count: r.table('experiment2datafile').getAll(e('id'), {index: 'experiment_id'}).count(),
                    samples_count: r.table('experiment2sample').getAll(e('id'), {index: 'experiment_id'}).count(),
                    processes_count: r.table('experiment2process').getAll(e('id'), {index: 'experiment_id'}).count(),
                };
            });
    }

    async function renameExperiment(experimentId, name) {
        let changes = await r.table('experiments').get(experimentId).update({name: name});
        return changes.replaced !== 0;
    }

    return {
        createExperiment,
        getExperiment,
        renameExperiment,
    };
};