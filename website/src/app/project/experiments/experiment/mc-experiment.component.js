angular.module('materialscommons').component('mcExperiment', {
    templateUrl: 'app/project/experiments/experiment/mc-experiment.html',
    controller: MCExperimentComponentController
});

/*@ngInject*/
function MCExperimentComponentController(currentExperiment) {
    let ctrl = this;
    ctrl.experiment = currentExperiment.get();
}