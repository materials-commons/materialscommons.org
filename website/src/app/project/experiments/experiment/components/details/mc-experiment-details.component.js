angular.module('materialscommons').component('mcExperimentDetails', {
    templateUrl: 'app/project/experiments/experiment/components/details/mc-experiment-details.html',
    controller: MCExperimentDetailsComponentController,
    bindings: {
        experiment: '='
    }
});

/*@ngInject*/
function MCExperimentDetailsComponentController() {
}
