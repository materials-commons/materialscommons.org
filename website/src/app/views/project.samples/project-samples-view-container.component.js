class MCProjectSamplesViewContainerComponentController {
    /*@ngInject*/
    constructor(projectsAPI, User, $stateParams) {
        this.projectsAPI = projectsAPI;
        this.projectId = $stateParams.project_id;
        this.state = {
            samples: [],
            filter: '',
            isBetaUser: User.isBetaUser(),
        };
    }

    $onInit() {
        this.projectsAPI.getSamplesWithConditionsForProject(this.projectId).then(samples => this.state.samples = samples);
    }
}

angular.module('materialscommons').component('mcProjectSamplesViewContainer', {
    controller: MCProjectSamplesViewContainerComponentController,
    // template: ``
    template: `
           <mc-samples-table2 samples="$ctrl.state.samples" flex layout="column" layout-margin ng-if="!$ctrl.state.isBetaUser"></mc-samples-table2>
           <mc-samples-list2 samples="$ctrl.state.samples" flex layout="column" layout-margin ng-if="$ctrl.state.isBetaUser"></mc-samples-list2>
    `
});
