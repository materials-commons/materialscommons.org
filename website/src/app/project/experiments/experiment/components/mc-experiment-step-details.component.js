angular.module('materialscommons').component('mcExperimentStepDetails', {
    templateUrl: 'app/project/experiments/experiment/components/mc-experiment-details.html',
    controller: MCExperimentStepDetailsComponentController,
    bindings: {
        step: '='
    }
});

/*@ngInject*/
function MCExperimentStepDetailsComponentController() {
    let ctrl = this;
    ctrl.editorOptions = {
        height: '55vh',
        width: '93vw'
    };
}
