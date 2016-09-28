angular.module('materialscommons').component('mcExperimentProcesses', {
    templateUrl: 'app/project/experiments/experiment/components/processes/mc-experiment-processes.html',
    controller: MCExperimentProcessesComponentController,
    bindings: {
        processes: '<'
    }
});

/*@ngInject*/
function MCExperimentProcessesComponentController() {
    var ctrl = this;
    ctrl.showTableView = true;
}