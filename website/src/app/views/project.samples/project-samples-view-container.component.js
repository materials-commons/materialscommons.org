class MCProjectSamplesViewContainerComponentController {
    /*@ngInject*/
    constructor(projectsAPI, $stateParams) {
        this.projectsAPI = projectsAPI;
        this.projectId = $stateParams.project_id;
        this.state = {
            samples: [],
            filter: '',
        };
    }

    $onInit() {
        this.projectsAPI.getSamplesWithConditionsForProject(this.projectId).then(samples => this.state.samples = samples);
    }
}

angular.module('materialscommons').component('mcProjectSamplesViewContainer', {
    controller: MCProjectSamplesViewContainerComponentController,
    // template: `<mc-project-samples-table2 samples="$ctrl.state.samples" flex layout="column" layout-margin></mc-project-samples-table2>`
    template: `
    <div layout="column" layout-margin flex>
        <input ng-model="$ctrl.state.filter">
        <mc-sample-card ng-repeat="sample in $ctrl.state.samples | filter:$ctrl.state.filtere" sample="sample"></mc-sample-card>
    </div>
    `
});
