class MCWorkflowFiltersComponentController {
    /*@ngInject*/
    constructor() {
        this.whichFilter = 'all';
    }
}

angular.module('materialscommons').component('mcWorkflowFilters', {
    templateUrl: 'app/project/experiments/experiment/components/workflow/mc-workflow-filters.html',
    controller: MCWorkflowFiltersComponentController
});
