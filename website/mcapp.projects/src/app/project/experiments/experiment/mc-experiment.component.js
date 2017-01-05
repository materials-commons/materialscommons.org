class MCExperimentComponentController {
    /*@ngInject*/
    constructor(mcreg) {
        this.experiment = mcreg.current$experiment;
    }
}

angular.module('materialscommons').component('mcExperiment', {
    templateUrl: 'app/project/experiments/experiment/mc-experiment.html',
    controller: MCExperimentComponentController
});