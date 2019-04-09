class MCFileProcessesComponentController {
    /*@ngInject*/
    constructor() {
        this.state = {
            processes: [],
        };
    }

    $onChanges(changes) {
        if (changes.processes) {
            this.state.processes = angular.copy(changes.processes.currentValue);
        }
    }
}

angular.module('materialscommons').component('mcFileProcesses', {
    controller: MCFileProcessesComponentController,
    template: require('./mc-file-processes.html'),
    bindings: {
        processes: '<'
    }
});