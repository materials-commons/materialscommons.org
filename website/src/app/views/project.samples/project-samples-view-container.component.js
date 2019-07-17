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
    // template: ``
    template: `
           <mc-samples-table2 samples="$ctrl.state.samples" flex layout="column" layout-margin></mc-samples-table2>
    `
});
