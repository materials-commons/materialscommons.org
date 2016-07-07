class MCDatasetProcessesComponentController {
    /*@ngInject*/
    constructor() {

    }
}

angular.module('materialscommons').component('mcDatasetProcesses', {
    templateUrl: 'app/project/experiments/experiment/components/dataset/components/mc-dataset-processes.html',
    controller: MCDatasetProcessesComponentController,
    bindings: {
        processes: '<'
    }
});
