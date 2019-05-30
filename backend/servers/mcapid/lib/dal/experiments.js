const model = require('@lib/model');
const _ = require('lodash');
const {api} = require('actionhero');

module.exports = function(r) {
    const db = require('./db')(r);

    async function createExperiment(name, description, owner, projectId, inProgress) {
        let e = new model.Experiment(name, owner);
        e.description = description;
        e.in_progress = inProgress;
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

    async function updateInProgress(experimentId, inProgress) {
        await r.table('experiments').get(experimentId).update({in_progress: inProgress});
        return true;
    }

    async function renameExperiment(experimentId, name) {
        let changes = await r.table('experiments').get(experimentId).update({name: name});
        return changes.replaced !== 0;
    }

    async function getExperimentSimple(experimentId) {
        return await r.table('experiments').get(experimentId);
    }

    async function addExperimentToDeleteItems(experimentId, projectId) {
        await r.table('delete_item').insert({project_id: projectId, experiment_id: experimentId});
        return true;
    }

    async function removeExperimentFromJoinTables(experimentId, projectId) {
        await r.table('project2experiment').getAll([projectId, experimentId], {index: 'project_experiment'}).delete();

        let samplesToDelete = await determineExperimentSamplesToRemoveFromProject(experimentId, projectId);
        let processesToDelete = await determineExperimentProcessesToRemove(experimentId, samplesToDelete);

        if (samplesToDelete.length) {
            await r.table('project2sample').getAll(r.args(samplesToDelete), {index: 'sample_id'}).delete();
        }

        if (processesToDelete.length) {
            await r.table('project2process').getAll(r.args(processesToDelete), {index: 'process_id'}).delete();
            await r.table('process2sample').getAll(r.args(processesToDelete), {index: 'process_id'}).delete();
        }

        return true;
    }

    // determineExperimentSamplesToRemoveFromProject returns the list of samples for an experiment that can
    // be removed. Samples that can't be removed are samples that are used in other experiments in the project.
    async function determineExperimentSamplesToRemoveFromProject(experimentId, projectId) {
        let existingExperimentSamples = await r.table('experiment2sample').getAll(experimentId, {index: 'experiment_id'});
        if (existingExperimentSamples.length) {
            let sampleIds = existingExperimentSamples.map(e2s => ({sampleId: e2s.sample_id}));
            let sampleIdsMap = _.keyBy(sampleIds, 'sampleId');
            // Are any of these samples used in other processes in experiment?
            let processesInExperiment = await r.table('experiment2process').getAll(experimentId, {index: 'experiment_id'});
            let processesInExperimentMap = _.keyBy(processesInExperiment, 'process_id');
            let match = await r.table('project2process').getAll(projectId, {index: 'project_id'})
                .eqJoin('process_id', r.table('process2sample'), {index: 'process_id'})
                .zip().pluck('sample_id', 'process_id');
            // remove all matches that are a process from the experiment we are deleting
            match = match.filter(m => {
                return !_.has(processesInExperimentMap, m.process_id);
            });
            let samplesInOtherProcesses = match.filter(s => {
                return _.has(sampleIdsMap, s.sample_id);
            });
            if (samplesInOtherProcesses.length) {
                // There are samples in the experiment that are used in processes that
                // are not in the experiment. Remove those ids from the list of ids
                // we are cleaning up and add that sample back in to project2sample.
                let samplesInOtherProcessesMap = _.keyBy(samplesInOtherProcesses, 'sample_id');

                // remove them from sampleIds, which is the list of samples we wish to delete
                return sampleIds.filter(s => !_.has(samplesInOtherProcessesMap, s.sampleId)).map(s => s.sampleId);
            }
        }

        return existingExperimentSamples.map(e2s => e2s.sample_id);
    }

    // determineExperimentProcessesToRemove returns the list of processes to remove in the experiment that
    // are only processes from the list of samples to remove. See determineExperimentSamplesToRemoveFromProject
    // to see why not all samples in an experiment are removed when an experiment is deleted.
    async function determineExperimentProcessesToRemove(experimentId, sampleIdsToRemove) {
        let processesInExperiment = await r.table('experiment2process').getAll(experimentId, {index: 'experiment_id'});
        if (sampleIdsToRemove.length) {
            let processesWithDeletedSamples = await r.table('process2sample').getAll(r.args(sampleIdsToRemove), {index: 'sample_id'});
            let processesWithDeletedSamplesMap = _.keyBy(processesWithDeletedSamples, 'process_id');
            return processesInExperiment.filter(p => _.has(processesWithDeletedSamplesMap, p.process_id)).map(p => p.process_id);
        }

        return processesInExperiment.map(p => p.process_id);
    }

    async function addFilesByNameToExperiment(fileNames, experimentId, projectId) {
        let fileIds = [];
        for (let f of fileNames) {
            let file = await api.mc.files.fileByPath(projectId, f.path);
            if (file) {
                fileIds.push({file_id: file.id});
            }
        }

        return await addFilesByIdToExperiment(fileIds, experimentId);
    }

    async function addFilesByIdToExperiment(fileIds, experimentId) {
        let fileIdsToAdd = await removeExistingFileEntries(experimentId, fileIds);
        let toAdd = fileIdsToAdd.map(f => new model.Experiment2DataFile(experimentId, f.file_id));
        await r.table('experiment2datafile').insert(toAdd);
        return true;
    }

    async function removeExistingFileEntries(experimentId, fileIds) {
        if (fileIds.length) {
            let indexEntries = fileIds.map(f => [experimentId, f.file_id]);
            let matchingEntries = await r.table('experiment2datafile').getAll(r.args(indexEntries), {index: 'experiment_datafile'});
            let byFileID = _.keyBy(matchingEntries, 'datafile_id');
            return fileIds.filter(f => (!(f.file_id in byFileID)));
        }

        return fileIds;
    }

    return {
        createExperiment,
        updateInProgress,
        getExperiment,
        renameExperiment,
        getExperimentSimple,
        addExperimentToDeleteItems,
        removeExperimentFromJoinTables,
        addFilesByNameToExperiment,
        addFilesByIdToExperiment,
    };
};