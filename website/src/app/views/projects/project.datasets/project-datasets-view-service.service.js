class ProjectDatasetsViewService {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    createNewDataset() {
        return this.$mdDialog.show({
            templateUrl: 'app/modals/create-new-dataset-dialog.html',
            controller: CreateNewDatasetDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
        });
    }
}

angular.module('materialscommons').service('projectDatasetsViewService', ProjectDatasetsViewService);

class CreateNewDatasetDialogController {
    /*@ngInject*/
    constructor($mdDialog, mcprojstore, createDatasetDialogState) {
        this.$mdDialog = $mdDialog;
        this.mcprojstore = mcprojstore;
        this.createDatasetDialogState = createDatasetDialogState;
        this.state = {
            project: mcprojstore.currentProject,
            datasetName: "",
        };
        this.state.experiments = _.values(this.state.project.experiments);
        this.state.samples = _.values(this.state.project.samples);
        this.createDatasetDialogState.computeExperimentsForSamples(this.state.project, this.state.samples);
    }

    experimentSelected() {
        let selectedSamples = this.createDatasetDialogState.determineSelectedSamplesForExperiments(this.state.experiments);
        this.createDatasetDialogState.resetSampleState(selectedSamples, this.state.samples);
    }

    done() {
        const samples = this.state.samples.filter(s => s.selected);
        let experiments = {};
        samples.forEach(s => {
            s.experiments.forEach(e => {
                experiments[e.id] = {id: e.id, name: e.name};
            });
        });
        this.$mdDialog.hide({
            name: this.state.datasetName,
            samples: this.state.samples.filter(s => s.selected),
            experiments: _.values(experiments),
        });
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

class CreateDatasetDialogStateService {
    /*@ngInject*/
    constructor() {
    }

    determineSelectedSamplesForExperiments(experiments) {
        let selectedSamples = {};
        experiments.filter(e => e.selected).forEach(e => {
            _.values(e.samples).forEach(s => selectedSamples[s.id] = true);
        });
        return selectedSamples;
    }

    resetSampleState(selectedSamples, samples) {
        samples.forEach(s => {
            if (s.id in selectedSamples) {
                s.selected = true;
            } else {
                s.selected = false;
            }
        });
    }

    computeExperimentsForSamples(project, samples) {
        samples.forEach(s => {
            s.experiments = [];
            _.values(project.experiments).forEach(e => {
                if (s.id in project.experiments[e.id].samples) {
                    s.experiments.push({experiment_id: e.id, name: e.name});
                }
            });
            s.experimentNames = s.experiments.map(e => e.name).join(", ")
        });
    }
}

angular.module('materialscommons').service('createDatasetDialogState', CreateDatasetDialogStateService);