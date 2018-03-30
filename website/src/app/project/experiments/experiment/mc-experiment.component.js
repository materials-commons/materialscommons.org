class MCExperimentComponentController {
    /*@ngInject*/
    constructor(mcprojstore, $stateParams) {
        this.experiment = mcprojstore.getExperiment($stateParams.experiment_id);
    }
}

angular.module('materialscommons').component('mcExperiment', {
    template: require('./mc-experiment.html'),
    controller: MCExperimentComponentController
});
