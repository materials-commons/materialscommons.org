class DatasetDetails2Service {
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    publishDataset(dataset) {
        return this.$mdDialog.show({
            templateUrl: 'app/modals/publish-dataset-dialog.html',
            controllerAs: '$ctrl',
            controller: PublishDatasetDialogController,
            bindToController: true,
            clickOutsideToClose: true,
            locals: {
                dataset: dataset
            }
        });
    }

    unpublishDataset(dataset) {
        return this.$mdDialog.show({
            templateUrl: 'app/modals/unpublish-dataset-dialog.html',
            controllerAs: '$ctrl',
            controller: UnpublishDatasetDialogController,
            bindToController: true,
            clickOutsideToClose: true,
            locals: {
                dataset: dataset
            }
        });
    }

    addPaper(dataset) {
        return this.$mdDialog.show({
            templateUrl: 'app/modals/add-paper-to-dataset-dialog.html',
            controllerAs: '$ctrl',
            controller: AddPaperToDatasetDialogController,
            bindToController: true,
            clickOutsideToClose: true,
            locals: {
                dataset: dataset
            }
        });
    }

    addAuthor(dataset) {
        return this.$mdDialog.show({
            templateUrl: 'app/modals/add-author-to-dataset-dialog.html',
            controllerAs: '$ctrl',
            controller: AddAuthorToDatasetDialogController,
            bindToController: true,
            clickOutsideToClose: true,
            locals: {
                dataset: dataset
            }
        });
    }

    addDoi() {
        return this.$mdDialog.show({
            templateUrl: 'app/modals/set-doi-dialog.html',
            controllerAs: '$ctrl',
            controller: SetDatasetDoiDialogController,
            bindToController: true,
            clickOutsideToClose: true,
            locals: {
                dataset: this.state.dataset
            }
        });
    }
}

class PublishDatasetDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    publish() {
        this.$mdDialog.hide();
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

class UnpublishDatasetDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    unpublish() {
        this.$mdDialog.hide();
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

class SetDatasetDoiDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
        let author = '';
        if (this.dataset.authors.length > 0) {
            author = this.dataset.authors[0].firstname
                + ' ' + this.dataset.authors[0].lastname;
        }
        this.state = {
            doi: {
                title: angular.copy(this.dataset.title),
                author: author,
                publicationDate: (new Date()).getFullYear(),
                description: angular.copy(this.dataset.description),
            }
        };
    }

    setDoi() {
        this.$mdDialog.hide(this.state.doi);
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

class AddPaperToDatasetDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
        this.state = {
            paper: {
                title: '',
                abstract: '',
                link: '',
                doi: '',
                authors: ''
            }
        };
    }

    addPaper() {
        this.$mdDialog.hide(this.state.paper);
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

class AddAuthorToDatasetDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
        this.state = {
            author: {
                lastname: '',
                firstname: '',
                affiliation: ''
            }
        };
    }

    addAuthor() {
        this.$mdDialog.hide(this.state.author);
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

angular.module('materialscommons').service('datasetDetails2Service', DatasetDetails2Service);