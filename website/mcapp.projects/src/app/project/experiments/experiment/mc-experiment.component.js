class MCExperimentComponentController {
    /*@ngInject*/
    constructor(mcstate) {
        this.experiment = mcstate.get(mcstate.CURRENT$EXPERIMENT);
    }
}

angular.module('materialscommons').component('mcExperiment', {
    templateUrl: 'app/project/experiments/experiment/mc-experiment.html',
    controller: MCExperimentComponentController
});