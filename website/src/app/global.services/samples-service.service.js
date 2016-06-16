class SamplesService {
    constructor(projectsAPI) {
        this.projectsAPI = projectsAPI;
    }

    addSamplesToExperiment(projectId, experimentId, sampleIds) {
        return this.projectsAPI(projectId).one('experiments', experimentId).one('samples')
            .customPOST({samples: sampleIds});
    }

    createSamplesInProjectForProcess(projectId, processId, samples) {
        return this.projectsAPI(projectId).one('samples').customPOST({process_id: processId, samples: samples});
    }

    getProjectSamples(projectID) {
        return this.projectsAPI(projectID).one('samples').getList();
    }

    deleteSamplesFromExperiment(projectId, experimentId, processId, sampleIds) {
        return this.projectsAPI(projectId).one('experiments', experimentId).one('samples').one('delete')
            .customPOST({process_id: processId, samples: sampleIds});
    }

    updateSampleInExperiment(projectId, experimentId, processId, sample) {
        return this.projectsAPI(projectId).one('experiments', experimentId).one('samples')
            .customPUT({
                process_id: processId,
                samples: [sample]
            });
    }
}

angular.module('materialscommons').service('samplesService', SamplesService);