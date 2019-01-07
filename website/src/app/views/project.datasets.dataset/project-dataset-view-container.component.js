class MCProjectDatasetViewContainerComponentController {
    /*@ngInject*/
    constructor($stateParams, $state, mcdsstore, datasetsAPI, mcStateStore, toast) {
        this.$stateParams = $stateParams;
        this.$state = $state;
        this.mcdsstore = mcdsstore;
        this.datasetsAPI = datasetsAPI;
        this.mcStateStore = mcStateStore;
        this.toast = toast;
        this.state = {
            dataset: null
        };
    }

    $onInit() {
        this.datasetsAPI.getDatasetForProject(this.$stateParams.project_id, this.$stateParams.dataset_id).then(
            (dataset) => {
                dataset.files = [];
                dataset.filesLoaded = false;
                dataset.samples = [];
                dataset.processes = [];
                dataset.samplesLoaded = false;
                this.state.dataset = angular.copy(dataset);
            }
        );
    }

    handleDeleteFiles(filesToDelete) {
        let filesMap = _.indexBy(filesToDelete, 'id'),
            fileIds = filesToDelete.map(f => f.id);
        this.datasetsAPI.deleteFilesFromProjectDataset(this.$stateParams.project_id, this.$stateParams.dataset_id, fileIds)
            .then(
                () => {
                    this.state.dataset.files = this.state.dataset.files.filter(f => (!(f.id in filesMap)));
                    this.state.dataset = angular.copy(this.state.dataset);
                }
            );
    }

    handleAddFiles(filesToAdd) {
        let existingFiles = _.indexBy(this.state.dataset.files, 'id'),
            newFiles = filesToAdd.filter(f => (!(f.id in existingFiles))),
            newFileIds = newFiles.map(f => f.id);
        this.datasetsAPI.addFilesToProjectDataset(this.$stateParams.project_id, this.$stateParams.dataset_id, newFileIds)
            .then(
                (d) => {
                    this.state.dataset = angular.copy(d);
                }
            );
    }

    handleUpdateDataset(dataset) {
        let ds = angular.copy(dataset);
        delete ds['files'];
        delete ds['samples'];
        delete ds['processes'];
        delete ds['comments'];
        this.datasetsAPI.updateProjectDatasetDetails(this.$stateParams.project_id, dataset.id, ds).then(
            (d) => {
                // Update doesn't return the full dataset, so we need to construct it
                // First copy over into returned object, then to trigger events copy
                // that into this.state.dataset
                d.files = this.state.dataset.files;
                d.samples = this.state.dataset.samples;
                d.processes = this.state.dataset.processes;
                d.comments = this.state.dataset.comments;
                d.status = this.state.dataset.status;
                this.state.dataset = d; //angular.copy(d);
            },
            () => this.toast.error('Unable to update dataset')
        );
    }

    handlePublishDataset() {
        this.datasetsAPI.publishProjectDataset(this.$stateParams.project_id, this.$stateParams.dataset_id).then(
            (d) => this.state.dataset = angular.copy(d),
            () => this.toast.error('Unable to publish dataset')
        );
    }

    handleUnpublishDataset() {
        this.datasetsAPI.unpublishProjectDataset(this.$stateParams.project_id, this.$stateParams.dataset_id).then(
            (d) => this.state.dataset = angular.copy(d),
            () => this.toast.error('Unable to unpublish dataset')
        );
    }

    handleAddDOI(doiDetails) {
        this.datasetsAPI.createDOI(this.$stateParams.project_id, this.$stateParams.dataset_id, doiDetails).then(
            (d) => {
                this.state.dataset.doi = d.doi;
                this.state.dataset.doi_url = d.doi_url;
                this.state.dataset = angular.copy(this.state.dataset); // trigger onChange
            },
            () => this.toast.error('Unable to create DOI for dataset')
        );
    }

    handleCancel() {
        this.$state.go('project.datasets.list');
    }

    handleLoadFiles() {
        this.datasetsAPI.getProjectDatasetFiles(this.$stateParams.project_id, this.$stateParams.dataset_id).then(
            (files) => {
                this.state.dataset.filesLoaded = true;
                this.state.dataset.files = files;
                this.state.dataset = angular.copy(this.state.dataset);
            });
    }

    handleLoadSamples() {
        this.datasetsAPI.getProjectDatasetSamplesAndProcesses(this.$stateParams.project_id, this.$stateParams.dataset_id).then(
            (dataset) => {
                let project = this.mcStateStore.getState('project');
                let transformedDS = this.mcdsstore.transformDataset(dataset, project);
                this.state.dataset.samples = transformedDS.samples;
                this.state.dataset.processes = transformedDS.processes;
                this.state.dataset.samplesLoaded = true;
                this.state.dataset = angular.copy(this.state.dataset);
            });
    }
}

angular.module('materialscommons').component('mcProjectDatasetViewContainer', {
    template: `<mc-project-dataset-view dataset="$ctrl.state.dataset" 
                                    on-delete-files="$ctrl.handleDeleteFiles(filesToDelete)"
                                    on-add-files="$ctrl.handleAddFiles(filesToAdd)"
                                    on-update-dataset="$ctrl.handleUpdateDataset(dataset)"
                                    on-publish-dataset="$ctrl.handlePublishDataset()"
                                    on-unpublish-dataset="$ctrl.handleUnpublishDataset()"
                                    on-add-doi="$ctrl.handleAddDOI(doiDetails)"
                                    on-cancel="$ctrl.handleCancel()"
                                    on-load-files="$ctrl.handleLoadFiles()"
                                    on-load-samples="$ctrl.handleLoadSamples()"
                                    layout-fill ng-if="$ctrl.state.dataset"></mc-project-dataset-view>`,
    controller: MCProjectDatasetViewContainerComponentController
});