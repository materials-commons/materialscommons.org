class WorkflowFiltersService {
    /*@ngInject*/
    constructor($mdDialog, experimentsService, mcbus) {
        this.$mdDialog = $mdDialog;
        this.experimentsService = experimentsService;
        this.mcbus = mcbus;
    }

    filterBySamples(projectId, experimentId) {
        this.experimentsService.getSamplesForExperiment(projectId, experimentId).then(
            (samples) => {
                this.$mdDialog.show({
                    templateUrl: 'app/project/experiments/experiment/components/workflow/services/filter-by-samples-dialog.html',
                    controller: FitlerBySamplesDialogController,
                    controllerAs: '$ctrl',
                    bindToController: true,
                    locals: {
                        samples: samples
                    }
                }).then((chosenSamples) => {
                    this.mcbus.send('WORKFLOW$FILTER$BYSAMPLES', chosenSamples);
                });
            }
        );
    }
}

class FitlerBySamplesDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
        this.filterSamplesListBy = "";
        this.selectedSamples = [];
        this.allSamples = angular.copy(this.samples);
    }

    addToFilter(sample) {
        this.selectedSamples.push(sample);
        const i = _.indexOf(this.allSamples, (s) => s.id === sample.id);
        if (i !== -1) {
            this.allSamples.splice(i, 1);
        }
    }

    removeFromFilter(sample) {
        this.allSamples.push(sample);
        const i = _.indexOf(this.selectedSamples, (s) => s.id === sample.id);
        if (i !== -1) {
            sample.selected = false;
            this.selectedSamples.splice(i, 1);
        }
    }

    done() {
        this.$mdDialog.hide(this.selectedSamples);
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

angular.module('materialscommons').service('workflowFiltersService', WorkflowFiltersService);