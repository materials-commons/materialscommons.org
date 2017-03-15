class MCExperimentOverviewDetailsComponentController {
    /*@ngInject*/
    constructor() {

    }

    $onInit() {
        //this.measuredSamples = this.experiment.samples.filter(e => e.process_count > 1);
    }
}

angular.module('materialscommons').component('mcExperimentOverviewDetails', {
    templateUrl: 'app/project/home/mc-experiment-overview-details.html',
    controller: MCExperimentOverviewDetailsComponentController,
    bindings: {
        experiment: '<'
    }
});
