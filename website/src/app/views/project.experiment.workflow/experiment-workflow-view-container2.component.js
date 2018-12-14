class MCExperimentWorkflowViewContainer2ComponentController {
    /*@ngInject*/
    constructor(templates, mcStateStore, mcprojstore, $stateParams) {
        this.templates = templates;
        this.mcStateStore = mcStateStore;
        this.mcprojstore = mcprojstore;
        this.$stateParams = $stateParams;
        this.state = {
            experiment: null,
            templates: null,
        };
    }

    $onChanges(changes) {
        if (changes.experiment) {
            this.state.experiment = this.buildProcessRelationships(changes.experiment.currentValue);
            this.state.processes = this.state.experiment.processes;
            this.mcStateStore.updateState('experiment', this.state.experiment);
        }
    }

    $onInit() {
        this.templates.getServerTemplates().then(t => this.state.templates = t);
    }

    // An experiment has a list of samples a list of processes and a relationships.process2sample array
    // that maps samples/property_set_id/direction to a process. The workflow graph examples that each
    // process will have an input_samples and output_samples list. Here we create those lists.
    buildProcessRelationships(experiment) {
        experiment.processes.forEach(p => {
            let inputSamples = experiment.relationships.process2sample
                .filter(entry => entry.direction === 'in' && entry.process_id === p.id);
            let outputSamples = experiment.relationships.process2sample
                .filter(entry => entry.direction === 'out' && entry.process_id === p.id);
            p.input_samples = inputSamples;
            p.output_samples = outputSamples;
        });

        return experiment;
    }
}

angular.module('materialscommons').component('mcExperimentWorkflowViewContainer2', {
    controller: MCExperimentWorkflowViewContainer2ComponentController,
    template: `<mc-processes-workflow ng-if="$ctrl.state.templates !== null"
                    processes="$ctrl.state.experiment.processes"></mc-processes-workflow>`,
    bindings: {
        experiment: '<'
    }
});