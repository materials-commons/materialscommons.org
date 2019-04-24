module.exports = function(r) {

    async function deleteExperimentFromProject(experimentId, projectId) {
        let existingExperimentSamples = await r.table('experiment2sample').getAll(experimentId, {index: 'experiment_id'});
        if (existingExperimentSamples.length) {
            let sampleIds = existingExperimentSamples.map(e2s => ({sampleId: e2s.sample_id}));
            let sampleIdsMap = _.keyBy(sampleIds, 'sampleId');
            // Are any of these samples used in other processes in experiment?
            let match = await r.table('project2process').getAll(projectId, {index: 'project_id'})
                .eqJoin('process_id', r.table('process2sample'), {index: 'process_id'})
                .zip().pluck('sample_id');
            let samplesInOtherProcesses = match.filter(s => {
                return _.has(sampleIdsMap, s.sample_id);
            });
            if (samplesInOtherProcesses.length) {
                // There are samples in the experiment that are used in processes that
                // are not in the experiment. Remove those ids from the list of ids
                // we are cleaning up and add that sample back in to project2sample.
                let samplesInOtherProcessesMap = _.keyBy(samplesInOtherProcesses, 'sample_id');

                // remove them from sampleIds, which is the list of samples we wish to delete
                sampleIds = sampleIds.filter(s => !_.has(samplesInOtherProcessesMap, s.sampleId));

                // Add samplesInOtherProcesses back into project2sample
                for (let i = 0; i < samplesInOtherProcesses.length; i++) {
                    await r.table('project2sample').insert({project_id: projectId, sample_id: samplesInOtherProcesses[i].sample_id});
                }
            }

        }
    }

    return {
        deleteExperimentFromProject,
    };
};