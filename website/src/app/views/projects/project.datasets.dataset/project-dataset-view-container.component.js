class MCProjectDatasetViewContainerComponentController {
    /*@ngInject*/
    constructor ($stateParams, mcdsstore, datasetsAPI) {
        this.$stateParams = $stateParams
        this.mcdsstore = mcdsstore
        this.datasetsAPI = datasetsAPI
        this.state = {
            dataset: null
        }
    }

    $onInit () {
        this.state.dataset = angular.copy(this.mcdsstore.getDataset(this.$stateParams.dataset_id))
    }

    handleDeleteFiles (filesToDelete) {
        let filesMap = _.indexBy(filesToDelete, 'id'),
            fileIds = filesToDelete.map(f => f.id)
        this.datasetsAPI.deleteFilesFromProjectDataset(this.$stateParams.project_id, this.$stateParams.dataset_id, fileIds)
            .then(
                () => {
                    this.state.dataset.files = this.state.dataset.files.filter(f => (!(f.id in filesMap)))
                    this.state.dataset = angular.copy(this.state.dataset)
                }
            )
    }

    handleAddFiles (filesToAdd) {
        let existingFiles = _.indexBy(this.state.dataset.files, 'id'),
            newFiles = filesToAdd.filter(f => (!(f.id in existingFiles))),
            newFileIds = newFiles.map(f => f.id)
        this.datasetsAPI.addFilesToProjectDataset(this.$stateParams.project_id, this.$stateParams.dataset_id, newFileIds)
            .then(
                () => {
                    this.state.dataset.files = this.state.dataset.files.concat(newFiles)
                    this.state.dataset = angular.copy(this.state.dataset)
                }
            )
    }
}

angular.module('materialscommons').component('mcProjectDatasetViewContainer', {
    template: `<mc-project-dataset-view dataset="$ctrl.state.dataset" 
                                    on-delete-files="$ctrl.handleDeleteFiles(filesToDelete)"
                                    on-add-files="$ctrl.handleAddFiles(filesToAdd)"
                                    layout-fill ng-if="$ctrl.state.dataset"></mc-project-dataset-view>`,
    controller: MCProjectDatasetViewContainerComponentController
})