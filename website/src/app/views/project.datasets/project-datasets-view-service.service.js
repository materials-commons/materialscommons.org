class ProjectDatasetsViewService {
    /*@ngInject*/
    constructor($mdDialog, datasetsAPI, projectsAPI, toast) {
        this.$mdDialog = $mdDialog;
        this.datasetsAPI = datasetsAPI;
        this.projectsAPI = projectsAPI;
        this.toast = toast;
    }

    createNewDataset(projectId) {
        return this.projectsAPI.getProjectSamples(projectId).then(
            (samples) => this.$mdDialog.show({
                templateUrl: 'app/modals/create-new-dataset-dialog.html',
                controller: CreateNewDatasetDialogController,
                controllerAs: '$ctrl',
                bindToController: true,
                clickOutsideToClose: true,
                locals: {
                    samples: samples,
                }
            }).then(ds => {
                let samples = ds.samples.map(s => s.id);
                return this.datasetsAPI.createDatasetForProject(projectId, ds.title, samples).then(
                    dataset => {
                        ds.id = dataset.id;
                        return ds;
                    },
                    () => {
                        this.toast.error('Unable to create dataset');
                    }
                );
            })
        );
    }
}

angular.module('materialscommons').service('projectDatasetsViewService', ProjectDatasetsViewService);

class CreateNewDatasetDialogController {
    /*@ngInject*/
    constructor($mdDialog, createDatasetDialogState, mcStateStore) {
        this.$mdDialog = $mdDialog;
        this.createDatasetDialogState = createDatasetDialogState;
        this.mcStateStore = mcStateStore;
        this.state = {
            project: this.mcStateStore.getState('project'),
            datasetTitle: '',
        };
        this.state.project.samples = this.samples;
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
            e.samples = [];
            experimentLookupTable[e.id] = {};
        });
        project.samples.forEach(s => {
            s.experiments.forEach(e => {
                if (e.id in experimentLookupTable) {
                    if (!(s.id in experimentLookupTable[e.id])) {
                        experimentLookupTable[e.id][s.id] = s;
                        let i = _.findIndex(project.experiments, exp => exp.id == e.id);
                        let exp = project.experiments[i];
                        exp.samples.push(s);
                    }
                }
            });
        });
        project.samples.forEach(s => {
            s.experiments = [];
            project.experiments.forEach(e => {
                if (s.id in experimentLookupTable[e.id]) {
                    s.experiments.push({experiment_id: e.id, name: e.name});
                }
            });
            s.experimentNames = s.experiments.map(e => e.name).join(', ');
        });
    }
}

angular.module('materialscommons').service('createDatasetDialogState', CreateDatasetDialogStateService);
