class MCDatasetWorkflowFiltersComponentController {
    /*@ngInject*/
    constructor() {
        this.showProcessesFilter = true;
    }

    $onInit() {
        this.processes = this.dataset.processes;
        this.samples = this.dataset.samples;
    }

    activateProcessesFilter() {
        this.showSamplesFilter = false;
        this.showProcessesFilter = true;
    }

    activateSamplesFilter() {
        this.showSamplesFilter = true;
        this.showProcessesFilter = false;
    }
}

angular.module('materialscommons').component('mcDatasetWorkflowFilters', {
    templateUrl: 'app/project/experiments/experiment/components/workflow/mc-workflow-filters.html',
    controller: MCDatasetWorkflowFiltersComponentController,
    bindings: {
        dataset: '<'
    }
})
