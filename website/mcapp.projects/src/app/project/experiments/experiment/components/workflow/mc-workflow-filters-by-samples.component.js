class MCWorkflowFiltersBySamplesComponentController {
    /*@ngInject*/
    constructor(mcshow, mcbus, $stateParams) {
        this.mcshow = mcshow;
        this.mcbus = mcbus;
        this.selectedSamples = [];
        this.filterSamplesListBy = "";
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
    }

    showSample(sample) {
        this.mcshow.sampleDialog(sample);
    }

    toggleEntry(sample) {
        if (sample.selected) {
            this.addToFilter(sample);
        } else {
            this.removeFromFilter(sample);
        }
    }

    addToFilter(sample) {
        this.selectedSamples.push(sample);
    }

    removeFromFilter(sample) {
        const i = _.indexOf(this.selectedSamples, (s) => s.id === sample.id);
        if (i !== -1) {
            sample.selected = false;
            this.selectedSamples.splice(i, 1);
        }
    }

    clearFilter() {
        this.selectedSamples.length = 0;
        this.samples.forEach(s => s.selected = false);
        this.mcbus.send('WORKFLOW$RESET');
    }

    applySamplesFilter() {
        this.mcbus.send('WORKFLOW$FILTER$BYSAMPLES', this.selectedSamples);
    }
}

angular.module('materialscommons').component('mcWorkflowFiltersBySamples', {
    templateUrl: 'app/project/experiments/experiment/components/workflow/mc-workflow-filters-by-samples.html',
    controller: MCWorkflowFiltersBySamplesComponentController,
    bindings: {
        samples: '<'
    }
});
