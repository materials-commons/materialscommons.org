class MCExperimentWorkflowViewContainerComponentController {
    /*@ngInject*/
    constructor(templates) {
        this.state = {
            experiment: null,
            templates: templates.get(),
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
    template: `<mc-experiment-workflow-view experiment="$ctrl.state.experiment" templates="$ctrl.state.templates">
                    </mc-experiment-workflow-view>`,
    bindings: {
        experiment: '<'
    }
});