const {api, Task} = require('actionhero');
const _ = require('lodash');

module.exports.DeleteExperimentFromProjectTask = class DeleteExperimentFromProjectTask extends Task {
    constructor() {
        super();
        this.name = 'deleteExperimentFromProject';
        this.description = 'Delete experiment from project';
        this.frequency = 0;
        this.queue = 'delete';
    }

    async run(args) {
        api.mc.log.info(`Deleting experiment ${args.experimentId} from project ${args.projectId}`);
        try {
            return await deleteExperimentFromProject(args.experimentId, args.projectId);
        } catch (e) {
            api.mc.log.info(`Failed deleting experiment ${args.experimentId} from project ${args.projectId}`, e);
            return false;
        }
    }
};

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