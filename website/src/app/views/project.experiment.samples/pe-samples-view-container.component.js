class MCProjectExperimentSamplesViewContainerComponentController {
    /*@ngInject*/
    constructor(experimentsAPI, $stateParams) {
        this.experimentsAPI = experimentsAPI;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.state = {
            samples: [],
            filter: '',
        };
    }

    $onInit() {
        this.experimentsAPI.getSamplesWithProcessAttributesForExperiment(this.experimentId, this.projectId).then(
            samples => this.state.samples = samples
        );
    }
}

angular.module('materialscommons').component('mcProjectExperimentSamplesViewContainer', {
    controller: MCProjectExperimentSamplesViewContainerComponentController,
    template: `
           <mc-samples-table2 samples="$ctrl.state.samples" flex layout="column" layout-margin></mc-samples-table2>
    `
});
