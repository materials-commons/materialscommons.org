class MCProjectDatasetViewContainerComponentController {
    /*@ngInject*/
    constructor($stateParams, mcdsstore, datasetsAPI, mcprojectstore2, toast) {
        this.$stateParams = $stateParams;
        this.mcdsstore = mcdsstore;
        this.datasetsAPI = datasetsAPI;
        this.mcprojectstore = mcprojectstore2;
        this.toast = toast;
        this.state = {
            dataset: null
        };
    }

    $onInit () {
        this.datasetsAPI.getDatasetForProject(this.$stateParams.project_id, this.$stateParams.dataset_id).then(
            (dataset) => {
                let project = this.mcprojectstore.getCurrentProject();
                let transformedDS = this.mcdsstore.transformDataset(dataset, project);
                this.mcdsstore.updateDataset(transformedDS);
                this.state.dataset = angular.copy(this.mcdsstore.getDataset(this.$stateParams.dataset_id));
            }
        );
    }

    handleDeleteFiles (filesToDelete) {
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

    handleAddFiles (filesToAdd) {
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

    handleUpdateDataset (dataset) {
        this.datasetsAPI.updateProjectDatasetDetails(this.$stateParams.project_id, this.$stateParams.dataset_id, dataset).then(
            (d) => this.state.dataset = angular.copy(d),
            () => this.toast.error('Unable to update dataset')
        );
    }

    handlePublishDataset () {
        this.datasetsAPI.publishProjectDataset(this.$stateParams.project_id, this.$stateParams.dataset_id).then(
            (d) => this.state.dataset = angular.copy(d),
            () => this.toast.error('Unable to publish dataset')
        );
    }

    handleUnpublishDataset () {
        this.datasetsAPI.unpublishProjectDataset(this.$stateParams.project_id, this.$stateParams.dataset_id).then(
            (d) => this.state.dataset = angular.copy(d),
            () => this.toast.error('Unable to unpublish dataset')
        );
    }

    handleAddDOI (doiDetails) {
        this.datasetsAPI.createDOI(this.$stateParams.project_id, this.$stateParams.dataset_id, doiDetails).then(
            (d) => {
                this.state.dataset.doi = d.doi;
                this.state.dataset.doi_url = d.doi_url;
                this.state.dataset = angular.copy(this.state.dataset); // trigger onChange
            },
            () => this.toast.error('Unable to create DOI for dataset')
        );
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
                                    layout-fill ng-if="$ctrl.state.dataset"></mc-project-dataset-view>`,
    controller: MCProjectDatasetViewContainerComponentController
});