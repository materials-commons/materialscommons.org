class MCProjectExperimentSamplesViewContainerComponentController {
    /*@ngInject*/
    constructor(experimentsAPI, User, $stateParams) {
        this.experimentsAPI = experimentsAPI;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.state = {
            samples: [],
            filter: '',
            isBetaUser: User.isBetaUser(),
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
           <mc-samples-table2 samples="$ctrl.state.samples" flex layout="column" layout-margin ng-if="!$ctrl.state.isBetaUser"></mc-samples-table2>
           <mc-samples-list2 samples="$ctrl.state.samples" flex layout="column" layout-margin ng-if="$ctrl.state.isBetaUser"></mc-samples-list2>
    `
});
