class MCDatasetDetailsComponentController {
    /*@ngInject*/
    constructor($stateParams, $mdDialog, datasetsAPI, toast, navbarOnChange, $window) {
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.datasetId = $stateParams.dataset_id;
        this.$mdDialog = $mdDialog;
        this.datasetsAPI = datasetsAPI;
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

        if ($window.location.hostname === 'mcdev.localhost') {
            let port = $window.location.port;
            this.publishedLink = `http://mctest.localhost:${port}/#/data/dataset/${this.datasetId}`;
        } else {
            let hostname = $window.location.hostname;
            this.publishedLink = `https://${hostname}/mcapp/#/data/dataset/${this.datasetId}`;
        }

        if (!this.dataset.keywords) {
            this.dataset.keywords = [];
        }
        if (this.dataset.doi) {
            datasetsAPI.getDoiExternalLink(this.projectId, this.experimentId, this.datasetId).then(
                urlResult => {
                    this.dataset.doi_url = urlResult.val;
                    this.navbarOnChange.fireChange();
                }
            )
        }
    }

    $onInit() {
        if (!this.dataset.published) {
            this.datasetsAPI.checkDataset(this.projectId, this.experimentId, this.datasetId).then(
                (status) => {
                    this.dataset.status = status;
                }
            );
        }
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

    addDoi() {
        this.$mdDialog.show({
            templateUrl: 'app/project/experiments/experiment/components/dataset/components/set-doi-dialog.html',
            controllerAs: '$ctrl',
            controller: SetDatasetDoiDialogController,
            bindToController: true,
            locals: {
                dataset: this.dataset
            }
        }).then(
            () => {
                this.navbarOnChange.fireChange();
            }
        );
    }

    updateDataset() {
        this.datasetsAPI.updateDatasetDetails(this.projectId, this.experimentId, this.datasetId, this.dataset)
            .then(
                () => null,
                () => this.toast.error('Unable to update dataset')
            );
    }

    updateDatasetPublicationDate() {
        //TODO: this needed?
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
    constructor($mdDialog, $stateParams, toast, datasetsAPI) {
        this.$mdDialog = $mdDialog;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.datasetId = $stateParams.dataset_id;
        this.toast = toast;
        this.datasetsAPI = datasetsAPI;
    }

    publish() {
        this.datasetsAPI.publishDataset(this.projectId, this.experimentId, this.datasetId)
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
    constructor($mdDialog, $stateParams, toast, datasetsAPI) {
        this.$mdDialog = $mdDialog;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.datasetId = $stateParams.dataset_id;
        this.toast = toast;
        this.datasetsAPI = datasetsAPI;
    }

    unpublish() {
        this.datasetsAPI.unpublishDataset(this.projectId, this.experimentId, this.datasetId)
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

class SetDatasetDoiDialogController {
    /*@ngInject*/
    constructor($mdDialog, $stateParams, toast, datasetsAPI) {
        this.$mdDialog = $mdDialog;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.datasetId = $stateParams.dataset_id;
        this.toast = toast;
        this.datasetsAPI = datasetsAPI;
        this.doiTitle = this.dataset.title;
        let author = "";
        if (this.dataset.authors.length > 0) {
            author = this.dataset.authors[0].firstname
                + " " + this.dataset.authors[0].lastname;
        }
        this.doiAuthor = author;
        this.doiPublicationDate = (new Date()).getFullYear();
        this.doiDescription = this.dataset.description;
    }

    setDoi() {
        let details = {
            title: this.doiTitle,
            author: this.doiAuthor,
            publication_year: this.doiPublicationDate
        };
        if (this.doiDescription) {
            details.description = this.doiDescription;
        }
        this.datasetsAPI.createNewDoi(this.projectId, this.experimentId, this.datasetId, details)
            .then(
                (result) => {
                    this.dataset.doi = result.val.doi;
                    this.datasetsAPI.getDoiExternalLink(this.projectId, this.experimentId, this.datasetId).then(
                        urlResult => {
                            this.dataset.doi_url = urlResult.val;
                            this.$mdDialog.hide();
                        }
                    )
                },
                () => {
                    this.toast.error('Unable to set dataset DOI value');
                    this.$mdDialog.cancel();
                }
            );
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

angular.module('materialscommons').component('mcDatasetDetails', {
    template: require('./mc-dataset-details.html'),
    controller: MCDatasetDetailsComponentController,
    bindings: {
        dataset: '<'
    }
});
