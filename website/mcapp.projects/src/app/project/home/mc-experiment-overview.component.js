class MCExperimentOverviewComponentController {
    /*@ngInject*/
    constructor() {

    }
}

angular.module('materialscommons').component('mcExperimentOverview', {
    templateUrl: 'app/project/home/mc-experiment-overview.html',
    controller: MCExperimentOverviewComponentController,
    bindings: {
        experiment: '<'
    }
});