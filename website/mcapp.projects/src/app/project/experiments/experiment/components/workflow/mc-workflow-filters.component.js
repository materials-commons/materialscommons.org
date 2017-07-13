class MCWorkflowFiltersComponentController {
    /*@ngInject*/
    constructor(workflowFiltersService, $stateParams) {
        this.whichFilter = 'all';
        this.workflowFiltersService = workflowFiltersService;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.showSamplesFilter = true;
        this.showProcessesFilter = false;
    }

    filterBySamples() {
        this.workflowFiltersService.filterBySamples(this.projectId, this.experimentId);
    }
}

angular.module('materialscommons').component('mcWorkflowFilters', {
    templateUrl: 'app/project/experiments/experiment/components/workflow/mc-workflow-filters.html',
    controller: MCWorkflowFiltersComponentController
});
