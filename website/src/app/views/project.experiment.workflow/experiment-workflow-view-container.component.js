class MCExperimentWorkflowViewContainerComponentController {
    /*@ngInject*/
    constructor(templates, mcStateStore, experimentsAPI, processesAPI, wvcCallbacks, wvcService, toast, $stateParams) {
        this.templates = templates;
        this.mcStateStore = mcStateStore;
        this.experimentsAPI = experimentsAPI;
        this.processesAPI = processesAPI;
        this.wvcCallbacks = wvcCallbacks;
        this.wvcService = wvcService;
        this.$stateParams = $stateParams;
        this.toast = toast;
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
        this.wvcCallbacks.registerCallback('handleUpdateProcess', (processId, attrs) => this.handleUpdateProcess(processId, attrs));
        this.wvcCallbacks.registerCallback('handleSelectFiles', process => this.handleSelectFiles(process));
        this.wvcCallbacks.registerCallback('handleSelectSamples', process => this.handleSelectSamples(process));
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

    handleLoadProcessDetails(processId) {
        return this.experimentsAPI.getProcessForExperiment(this.$stateParams.project_id, this.$stateParams.experiment_id, processId);
    }

    handleUpdateProcess(processId, attrs) {
        this.processesAPI.updateProcess(this.$stateParams.project_id, processId, attrs).then(
            () => null,
            () => this.toast.error('Unable to update process')
        );
    }

    handleSelectFiles(process) {
        this.wvcService.selectFiles(this.$stateParams.project_id, this.$stateParams.experiment_id, process).then(
            () => null,
        );
    }

    handleSelectSamples(process) {
        this.wvcService.selectSamples(this.$stateParams.project_id, this.$stateParams.experiment_id, process).then(() => null);
    }
}

angular.module('materialscommons').component('mcExperimentWorkflowViewContainer', {
    controller: MCExperimentWorkflowViewContainerComponentController,
    template: `<mc-experiment-workflow-view ng-if="$ctrl.state.template !== null"
                    experiment="$ctrl.state.experiment"
                    on-load-process-details="$ctrl.handleLoadProcessDetails(processId)"
                    templates="$ctrl.state.templates"></mc-experiment-workflow-view>`,
    bindings: {
        experiment: '<'
    }
});