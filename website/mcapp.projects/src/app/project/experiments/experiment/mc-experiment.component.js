class MCExperimentComponentController {
    /*@ngInject*/
    constructor(currentExperiment) {
        this.currentExperiment = currentExperiment;
        this.experiment = currentExperiment.get();
    }
}

angular.module('materialscommons').component('mcExperiment', {
    templateUrl: 'app/project/experiments/experiment/mc-experiment.html',
    controller: MCExperimentComponentController
});