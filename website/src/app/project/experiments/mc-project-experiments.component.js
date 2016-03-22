angular.module('materialscommons').component('mcProjectExperiments', {
    templateUrl: 'app/project/experiments/mc-project-experiments.html',
    controller: MCProjectExperimentsComponentController,
    bindings: {
        experiments: '='
    }
});

/*@ngInject*/
function MCProjectExperimentsComponentController() {
    let ctrl = this;
    ctrl.showTableView = true;
}


