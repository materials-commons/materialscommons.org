class MCExperimentWorkflowViewContainerComponentController {
    /*@ngInject*/
    constructor() {
        this.state = {
            experiment: null,
        };
    }

    $onChanges(changes) {
        if (changes.experiment) {
            this.state.experiment = changes.experiment.currentValue;
            this.state.processes = this.state.experiment.processes;
        }
    }
}

angular.module('materialscommons').component('mcExperimentWorkflowViewContainer', {
    controller: MCExperimentWorkflowViewContainerComponentController,
    template: `<mc-experiment-workflow-view experiment="$ctrl.state.experiment">
                    </mc-experiment-workflow-view>`,
    bindings: {
        experiment: '<'
    }
});