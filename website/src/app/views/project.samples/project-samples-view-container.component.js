class MCProjectSamplesViewContainerComponentController {
    /*@ngInject*/
    constructor(projectsAPI, $stateParams) {
        this.projectsAPI = projectsAPI;
        this.projectId = $stateParams.project_id;
        this.state = {
            samples: [],
        };
    }

    $onInit() {
        this.projectsAPI.getSamplesForProject(this.projectId).then(samples => this.state.samples = samples);
    }
}

angular.module('materialscommons').component('mcProjectSamplesViewContainer', {
    controller: MCProjectSamplesViewContainerComponentController,
    template: `<mc-project-samples-table2 samples="$ctrl.state.samples" flex layout="column" layout-margin></mc-project-samples-table2>`
});