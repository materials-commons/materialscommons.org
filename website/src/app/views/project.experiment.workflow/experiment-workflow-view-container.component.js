class MCExperimentWorkflowViewContainerComponentController {
    /*@ngInject*/
    constructor() {
        this.state = {
            experiment: null
        };
    }

    $onChanges(changes) {
        if (changes.experiment) {
            this.state.experiment = changes.experiment.currentValue;
        }
    }
}

angular.module('materialscommons').component('mcExperimentWorkflowViewContainer', {
    controller: MCExperimentWorkflowViewContainerComponentController,
    template: `<mc-experiment-workflow-view>
                    </mc-experiment-workflow-view>`,
    bindings: {
        experiment: '<'
    }
});