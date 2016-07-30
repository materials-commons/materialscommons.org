class MCDatasetDetailsComponentController {
    /*@ngInject*/
    constructor($stateParams, $mdDialog, datasetService, toast, navbarOnChange, $window) {
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.datasetId = $stateParams.dataset_id;
        this.$mdDialog = $mdDialog;
        this.datasetService = datasetService;
        this.toast = toast;
        this.navbarOnChange = navbarOnChange;
        this.pubDate = "";
        this.licenses = [
            {
                name: `Public Domain Dedication and License (PDDL)`,
                link: `http://opendatacommons.org/licenses/pddl/summary/`
            },
            {
                name: `Attribution License (ODC-By)`,
                link: `http://opendatacommons.org/licenses/by/summary/`
            },
            {
                name: `Open Database License (ODC-ODbL)`,
                link: `http://opendatacommons.org/licenses/odbl/summary/`
            }
        ];

    }

    addAuthor() {
        this.dataset.authors.push({
            lastname: '',
            firstname: '',
            affiliation: ''
        });
        this.updateDataset();
    }

    removeAuthor(index) {
        this.dataset.authors.splice(index, 1);
        this.updateDataset();
    }

    addPaper() {
        this.dataset.papers.push({
            title: '',
            abstract: '',
            link: '',
            doi: '',
            authors: ''
        });
        this.updateDataset();
    }

    removePaper(index) {
        this.dataset.papers.splice(index, 1);
        this.updateDataset();
    }

    updateDataset() {
        this.datasetService.updateDatasetDetails(this.projectId, this.experimentId, this.datasetId, this.dataset)
            .then(
                () => null,
                () => this.toast.error('Unable to update dataset')
            );
    }

    updateDatasetPublicationDate() {
        console.log('Pub date', this.pubDate);
        console.log('dataset', this.dataset.plain());
    }

    publishDataset() {
        this.$mdDialog.show({
            templateUrl: 'app/project/experiments/experiment/components/dataset/components/publish-dataset-dialog.html',
            controllerAs: '$ctrl',
            controller: PublishDatasetDialogController,
            bindToController: true,
            locals: {
                dataset: this.dataset
            }
        }).then(
            () => {
                this.dataset.published = true;
                this.navbarOnChange.fireChange();
            }
        );
    }

    unpublishDataset() {
        this.$mdDialog.show({
            templateUrl: 'app/project/experiments/experiment/components/dataset/components/unpublish-dataset-dialog.html',
            controllerAs: '$ctrl',
            controller: UnpublishDatasetDialogController,
            bindToController: true,
            locals: {
                dataset: this.dataset
            }
        }).then(
            () => {
                this.dataset.published = false;
                this.navbarOnChange.fireChange();
            }
        );
    }
}

class PublishDatasetDialogController {
    /*@ngInject*/
    constructor($mdDialog, $stateParams, toast, datasetService) {
        this.$mdDialog = $mdDialog;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.datasetId = $stateParams.dataset_id;
        this.toast = toast;
        this.datasetService = datasetService;
    }

    publish() {
        this.datasetService.publishDataset(this.projectId, this.experimentId, this.datasetId)
            .then(
                () => this.$mdDialog.hide(),
                () => {
                    this.toast.error('Unable to publish dataset');
                    this.$mdDialog.cancel();
                }
            );
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

class UnpublishDatasetDialogController {
    /*@ngInject*/
    constructor($mdDialog, $stateParams, toast, datasetService) {
        this.$mdDialog = $mdDialog;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.datasetId = $stateParams.dataset_id;
        this.toast = toast;
        this.datasetService = datasetService;
    }

    unpublish() {
        this.datasetService.unpublishDataset(this.projectId, this.experimentId, this.datasetId)
            .then(
                () => this.$mdDialog.hide(),
                () => {
                    this.toast.error('Unable to unpublish dataset');
                    this.$mdDialog.cancel();
                }
            );
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

angular.module('materialscommons').component('mcDatasetDetails', {
    templateUrl: 'app/project/experiments/experiment/components/dataset/components/mc-dataset-details.html',
    controller: MCDatasetDetailsComponentController,
    bindings: {
        dataset: '<'
    }
});
