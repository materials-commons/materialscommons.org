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
        this.updateComponentState('currentProcess', process);
    }

    updateComponentState(key, value) {
        this.$timeout(() => {
            this.state[key] = angular.copy(value);
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