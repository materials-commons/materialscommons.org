class WorkflowFiltersService {
    /*@ngInject*/
    constructor($mdDialog, experimentsAPI, mcbus) {
        this.$mdDialog = $mdDialog;
        this.experimentsAPI = experimentsAPI;
        this.mcbus = mcbus;
    }

    filterBySamples(projectId, experimentId) {
        this.experimentsAPI.getSamplesForExperiment(projectId, experimentId).then(
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
    constructor($mdDialog, mcshow) {
        this.$mdDialog = $mdDialog;
        this.mcshow = mcshow;
        this.filterSamplesListBy = "";
        this.selectedSamples = [];
        this.allSamples = angular.copy(this.samples);
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

    done() {
        this.$mdDialog.hide(this.selectedSamples);
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

angular.module('materialscommons').service('workflowFiltersService', WorkflowFiltersService);