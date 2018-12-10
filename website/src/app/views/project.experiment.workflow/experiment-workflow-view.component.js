class MCExperimentWorflowViewComponentController {
    /*@ngInject*/
    constructor($timeout) {
        this.$timeout = $timeout;
        this.state = {
            experiment: null,
            processes: [],
            showGraphView: true,
            currentProcess: null,
            showSidebar: true,
            templates: []
        };
    }

    $onChanges(changes) {
        if (changes.experiment) {
            this.state.experiment = angular.copy(changes.experiment.currentValue);
            this.state.processes = this.state.experiment.processes;
        }

        if (changes.templates) {
            this.state.templates = angular.copy(changes.templates.currentValue);
        }
    }

    handleSetCurrentProcess(process) {
        this.onLoadProcessDetails({processId: process.id}).then(
            p => this.state.currentProcess = p
        );
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
        experiment: '<',
        templates: '<',
        onLoadProcessDetails: '&',
    }
});