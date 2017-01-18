angular.module('materialscommons').component('mcExperimentProcesses', {
    templateUrl: 'app/project/experiments/experiment/components/workflow/mc-experiment-processes.html',
    controller: MCExperimentProcessesComponentController,
    bindings: {
        processes: '<'
    }
});

/*@ngInject*/
function MCExperimentProcessesComponentController() {
    const ctrl = this;
    ctrl.showTableView = true;
}