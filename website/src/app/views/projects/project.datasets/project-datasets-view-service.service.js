class ProjectDatasetsViewService {
    /*@ngInject*/
    constructor($mdDialog, datasetsAPI, toast) {
        this.$mdDialog = $mdDialog;
        this.datasetsAPI = datasetsAPI;
        this.toast = toast;
    }

    createNewDataset(projectId) {
        return this.$mdDialog.show({
            templateUrl: 'app/modals/create-new-dataset-dialog.html',
            controller: CreateNewDatasetDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
        }).then(ds => {
            let samples = ds.samples.map(s => s.id);
            return this.datasetsAPI.createDatasetForProject(projectId, ds.title, samples).then(
                dataset => {
                    ds.id = dataset.id;
                    return ds;
                },
                () => {
                    this.toast.error('Unable to create dataset')
                }
            );
        });
    }

    transformDataset(dataset, project) {
        let projectSamplesLookup = _.indexBy(project.samples, 'id');
        let transformedSamples = [],
            transformedDS = angular.copy(dataset);
        transformedDS.samples.forEach(s => {
            transformedSamples.push(projectSamplesLookup[s.id]);
        });
        transformedDS.samples = angular.copy(transformedSamples);
        return transformedDS;
    }
}

angular.module('materialscommons').service('projectDatasetsViewService', ProjectDatasetsViewService);

class CreateNewDatasetDialogController {
    /*@ngInject*/
    constructor($mdDialog, createDatasetDialogState, mcprojectstore2) {
        this.$mdDialog = $mdDialog;
        this.createDatasetDialogState = createDatasetDialogState;
        this.mcprojectstore = mcprojectstore2;
        this.state = {
            project: this.mcprojectstore.getCurrentProject(),
            datasetTitle: "",
        };
        this.createDatasetDialogState.computeExperimentsForSamples(this.state.project);
    }

    experimentSelected() {
        let selectedSamples = this.createDatasetDialogState.determineSelectedSamplesForExperiments(this.state.project.experiments);
        this.createDatasetDialogState.resetSampleState(selectedSamples, this.state.project.samples);
    }

    isInvalidDataset() {
        if (this.state.datasetTitle === '') {
            return true;
        }

        return false;
    }

    done() {
        const samples = this.state.project.samples.filter(s => s.selected);
        let experiments = {};
        samples.forEach(s => {
            s.experiments.forEach(e => {
                experiments[e.id] = {id: e.id, name: e.name};
            });
        });
        this.$mdDialog.hide({
            title: this.state.datasetTitle,
            samples: samples,
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
            e.samples.forEach(s => selectedSamples[s.id] = true);
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

    computeExperimentsForSamples(project) {
        let experimentLookupTable = {};
        project.experiments.forEach(e => {
            experimentLookupTable[e.id] = _.indexBy(e.samples, 'id');
        });
        project.samples.forEach(s => {
            s.experiments = [];
            project.experiments.forEach(e => {
                if (s.id in experimentLookupTable[e.id]) {
                    s.experiments.push({experiment_id: e.id, name: e.name});
                }
            });
            s.experimentNames = s.experiments.map(e => e.name).join(", ")
        });
    }
}

angular.module('materialscommons').service('createDatasetDialogState', CreateDatasetDialogStateService);