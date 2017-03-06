class MCExperimentOverviewDetailsComponentController {
    /*@ngInject*/
    constructor() {

    }
}

angular.module('materialscommons').component('mcExperimentOverviewDetails', {
    templateUrl: 'app/project/home/mc-experiment-overview-details.html',
    controller: MCExperimentOverviewDetailsComponentController,
    bindings: {
        experiment: '<'
    }
});
