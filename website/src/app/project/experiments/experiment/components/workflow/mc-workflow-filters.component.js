class MCWorkflowFiltersComponentController {
    /*@ngInject*/
    constructor(experimentsAPI, mcStateStore, $stateParams) {
        this.experimentsAPI = experimentsAPI;
        this.mcStateStore = mcStateStore;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.showSamplesFilter = true;
        this.showProcessesFilter = false;
    }

    $onInit() {
        this.activateSamplesFilter();
    }

    activateProcessesFilter() {
        let e = this.mcStateStore.getState('experiment');
        this.processes = _.values(e.processes);
        this.showProcessesFilter = true;
        this.showSamplesFilter = false;
    }

    activateSamplesFilter() {
        this.experimentsAPI.getSamplesForExperiment(this.projectId, this.experimentId).then(
            (samples) => {
                this.showProcessesFilter = false;
                this.showSamplesFilter = true;
                this.samples = samples;
            }
        );
    }
}

angular.module('materialscommons').component('mcWorkflowFilters', {
    template: require('./mc-workflow-filters.html'),
    controller: MCWorkflowFiltersComponentController
});
