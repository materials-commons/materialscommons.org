class MCProjectDatasetViewContainerComponentController {
    /*@ngInject*/
    constructor($stateParams, $state, mcdsstore, datasetsAPI, projectsAPI, projectFileTreeAPI, fileSelection, mcStateStore, toast) {
        this.$stateParams = $stateParams;
        this.$state = $state;
        this.mcdsstore = mcdsstore;
        this.datasetsAPI = datasetsAPI;
        this.projectsAPI = projectsAPI;
        this.projectFileTreeAPI = projectFileTreeAPI;
        this.fileSelection = fileSelection;
        this.mcStateStore = mcStateStore;
        this.toast = toast;
        this.state = {
            dataset: null,
            project: mcStateStore.getState('project'),
            filesLoaded: false,
        };
    }

    $onInit() {
        this.datasetsAPI.getDatasetForProject(this.state.project.id, this.$stateParams.dataset_id).then(
            (dataset) => {
                dataset.files = [];
                dataset.filesLoaded = false;
                dataset.samples = [];
                dataset.processes = [];
                dataset.samplesLoaded = false;
                this.state.dataset = angular.copy(dataset);
            }
        );

        this.projectsAPI.getProjectSamples(this.state.project.id).then(
            (samples) => {
                this.state.project.samples = samples;
            }
        );

        this.projectFileTreeAPI.getProjectRoot(this.state.project.id).then(
            files => {
                this.state.project.files = files;
                this.state.filesLoaded = true;
            }
        );
    }

    handleDeleteFiles(filesToDelete) {
        let filesMap = _.indexBy(filesToDelete, 'id'),
            fileIds = filesToDelete.map(f => f.id);
        this.datasetsAPI.deleteFilesFromProjectDataset(this.state.project.id, this.state.dataset.id, fileIds)
            .then(
                () => {
                    this.state.dataset.files = this.state.dataset.files.filter(f => (!(f.id in filesMap)));
                    this.state.dataset = angular.copy(this.state.dataset);
                }
            );
    }

    handleAddFiles(filesToAdd) {
        this.datasetsAPI.updateDatasetFileSelection(this.state.project.id, this.state.dataset.id, filesToAdd.selection).then(
            d => this.state.dataset = angular.copy(d)
        );
        // let existingFiles = _.indexBy(this.state.dataset.files, 'id'),
        //     newFiles = filesToAdd.filter(f => (!(f.id in existingFiles))),
        //     newFileIds = newFiles.map(f => f.id);
        // this.datasetsAPI.addFilesToProjectDataset(this.state.project.id, this.state.dataset.id, newFileIds)
        //     .then(
        //         (d) => {
        //             this.state.dataset = angular.copy(d);
        //         }
        //     );
    }

    handleSelectionChanged() {
        let selection = this.fileSelection.toSelection();
        // console.log('selection =', selection);
        this.datasetsAPI.updateDatasetFileSelection(this.state.project.id, this.state.dataset.id, selection).then(
            () => null
        );
    }

    handleUpdateDataset(dataset) {
        let ds = angular.copy(dataset);
        delete ds['files'];
        delete ds['samples'];
        delete ds['processes'];
        delete ds['comments'];
        this.datasetsAPI.updateProjectDatasetDetails(this.state.project.id, dataset.id, ds).then(
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

    handleAddAuthor(author) {
        this.state.dataset.authors.push(author);
        this.handleUpdateDataset(this.state.dataset);
    }

    handleAddPaper(paper) {
        this.state.dataset.papers.push(paper);
        this.handleUpdateDataset(this.state.dataset);
    }

    handlePublishDataset() {
        this.datasetsAPI.publishProjectDataset(this.state.project.id, this.state.dataset.id).then(
            (d) => this.state.dataset = angular.copy(d),
            () => this.toast.error('Unable to publish dataset')
        );
    }

    handlePublishPrivateDataset() {
        this.datasetsAPI.publishPrivateProjectDataset(this.state.project.id, this.state.dataset.id).then(
            (d) => this.state.dataset = angular.copy(d),
            () => this.toast.error('Unable to publish private dataset')
        );
    }

    handleUnpublishDataset() {
        this.datasetsAPI.unpublishProjectDataset(this.state.project.id, this.state.dataset.id).then(
            (d) => this.state.dataset = angular.copy(d),
            () => this.toast.error('Unable to unpublish dataset')
        );
    }

    handleAddDOI(doiDetails) {
        this.datasetsAPI.createDOI(this.state.project.id, this.state.dataset.id, doiDetails).then(
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
        this.datasetsAPI.getProjectDatasetFiles(this.state.project.id, this.state.dataset.id).then(
            (files) => {
                this.state.dataset.filesLoaded = true;
                this.state.dataset.files = files;
                this.state.dataset = angular.copy(this.state.dataset);
            });
    }

    handleLoadSamples() {
        this.datasetsAPI.getProjectDatasetSamplesAndProcesses(this.state.project.id, this.state.dataset.id).then(
            (dataset) => {
                let transformedDS = this.mcdsstore.transformDataset(dataset, this.state.project);
                this.state.dataset.samples = transformedDS.samples;
                this.state.dataset.processes = transformedDS.processes;
                this.state.dataset.samplesLoaded = true;
                this.state.dataset = angular.copy(this.state.dataset);
            });
    }
}

angular.module('materialscommons').component('mcProjectDatasetViewContainer', {
    template: `<mc-project-dataset-view dataset="$ctrl.state.dataset" ng-if="$ctrl.state.filesLoaded && $ctrl.state.dataset !== null"
                                    project="$ctrl.state.project"
                                    on-delete-files="$ctrl.handleDeleteFiles(filesToDelete)"
                                    on-add-files="$ctrl.handleAddFiles(filesToAdd)"
                                    on-selection-changed="$ctrl.handleSelectionChanged()"
                                    on-update-dataset="$ctrl.handleUpdateDataset(dataset)"
                                    on-publish-dataset="$ctrl.handlePublishDataset()"
                                    on-publish-private-dataset="$ctrl.handlePublishPrivateDataset()"
                                    on-unpublish-dataset="$ctrl.handleUnpublishDataset()"
                                    on-add-doi="$ctrl.handleAddDOI(doiDetails)"
                                    on-add-paper="$ctrl.handleAddPaper(paper)"
                                    on-add-author="$ctrl.handleAddAuthor(author)"
                                    on-cancel="$ctrl.handleCancel()"
                                    on-load-files="$ctrl.handleLoadFiles()"
                                    on-load-samples="$ctrl.handleLoadSamples()"
                                    layout-fill></mc-project-dataset-view>`,
    controller: MCProjectDatasetViewContainerComponentController
});