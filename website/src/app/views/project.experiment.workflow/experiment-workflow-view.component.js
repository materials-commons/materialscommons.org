class MCExperimentWorflowViewComponentController {
    /*@ngInject*/
    constructor($timeout) {
        this.$timeout = $timeout;
        this.state = {
            experiment: null,
            processes: [],
            showGraphView: true,
            currentProcess: {},
            showSidebar: true,
        };
    }

    $onChanges(changes) {
        if (changes.experiment) {
            this.state.experiment = angular.copy(changes.experiment.currentValue);
            this.state.processes = this.state.experiment.processes;
        }
    }

    handleSetCurrentProcess(process) {
        // console.log('handleSetCurrentProcess', process);
        this.$timeout(() => {
            this.state.currentProcess = angular.copy(process);
            console.log('this.state.currentProcess', this.state.currentProcess.id);
        });
    }
}

angular.module('materialscommons').component('mcExperimentWorkflowView', {
    controller: MCExperimentWorflowViewComponentController,
    template: require('./experiment-workflow-view.html'),
    bindings: {
        experiment: '<'
    }
});