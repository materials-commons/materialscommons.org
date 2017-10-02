class MCExperimentComponentController {
    /*@ngInject*/
    constructor(mcprojstore, $stateParams) {
        this.experiment = mcprojstore.getExperiment($stateParams.experiment_id);
    }
}

angular.module('materialscommons').component('mcExperiment', {
    templateUrl: 'app/project/experiments/experiment/mc-experiment.html',
    controller: MCExperimentComponentController
});