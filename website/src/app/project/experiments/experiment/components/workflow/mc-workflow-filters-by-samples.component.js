class MCWorkflowFiltersBySamplesComponentController {
    /*@ngInject*/
    constructor(mcshow, mcbus, $filter, $stateParams) {
        this.mcshow = mcshow;
        this.mcbus = mcbus;
        this.$filter = $filter;
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

        this.mcbus.send('WORKFLOW$RESTOREREMOVED');
        if (this.selectedSamples.length) {
            this.applySamplesFilter();
        }
    }

    showWorkflowFromFind() {
        let filteredSamples = this.$filter('filter')(this.samples, this.filterSamplesListBy);
        filteredSamples.forEach(s => {
            s.selected = true;
            this.addToFilter(s);
        });
        if (this.selectedSamples.length) {
            this.mcbus.send('WORKFLOW$RESTOREREMOVED');
            this.applySamplesFilter();
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
        this.filterSamplesListBy = "";
        this.mcbus.send('WORKFLOW$RESET');
    }

    applySamplesFilter() {
        this.mcbus.send('WORKFLOW$FILTER$BYSAMPLES', this.selectedSamples);
    }
}

angular.module('materialscommons').component('mcWorkflowFiltersBySamples', {
    template: require('./mc-workflow-filters-by-samples.html'),
    controller: MCWorkflowFiltersBySamplesComponentController,
    bindings: {
        samples: '<'
    }
});
