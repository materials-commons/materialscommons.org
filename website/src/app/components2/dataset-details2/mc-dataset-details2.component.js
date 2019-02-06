class MCDatasetDetails2ComponentController {
    /*@ngInject*/
    constructor($window, datasetDetails2Service) {
        this.state = {dataset: {}};
        this.$window = $window;
        this.datasetDetails2Service = datasetDetails2Service;
        this.changesMade = false;
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

    $onInit () {
        this.state.dataset = angular.copy(this.dataset);
        if (this.$window.location.hostname === 'mcdev.localhost') {
            let port = this.$window.location.port;
            this.state.publishedLink = `http://mctest.localhost:${port}/#/data/dataset/${this.state.dataset.id}`;
        } else {
            let hostname = this.$window.location.hostname;
            this.state.publishedLink = `https://${hostname}/mcapp/#/data/dataset/${this.state.dataset.id}`;
        }
    }

    $onChanges (changes) {
        if (changes.dataset) {
            this.state.dataset = angular.copy(changes.dataset.currentValue);
        }
    }

    $onDestroy() {
        if (this.changesMade) {
            this.updateDataset();
        }
    }

    addAuthor () {

        this.datasetDetails2Service.addAuthor(this.state.dataset).then(author => this.onAddAuthor({author: author}));

        // this.state.dataset.authors.push({
        //     lastname: '',
        //     firstname: '',
        //     affiliation: ''
        // });
        // this.changesMade = true;
    }

    removeAuthor (index) {
        this.state.dataset.authors.splice(index, 1);
        this.changesMade = true;
    }

    addPaper () {
        this.datasetDetails2Service.addPaper(this.state.dataset).then(paper => this.onAddPaper({paper: paper}));
        // this.state.dataset.papers.push({
        //     title: '',
        //     abstract: '',
        //     link: '',
        //     doi: '',
        //     authors: ''
        // });
        // this.changesMade = true;
    }

    removePaper (index) {
        this.state.dataset.papers.splice(index, 1);
        this.changesMade = true;
    }

    changed() {
        this.changesMade = true;
    }

    addDoi () {
        this.datasetDetails2Service.addDoit(this.state.dataset).then(doiDetails => this.onAddDoi({doiDetails: doiDetails}));
        // this.$mdDialog.show({
        //     templateUrl: 'app/modals/set-doi-dialog.html',
        //     controllerAs: '$ctrl',
        //     controller: SetDatasetDoiDialogController,
        //     bindToController: true,
        //     clickOutsideToClose: true,
        //     locals: {
        //         dataset: this.state.dataset
        //     }
        // }).then((doiDetails) => this.onAddDoi({doiDetails: doiDetails}));
    }

    updateDataset () {
        this.onUpdateDataset({dataset: this.state.dataset});
        this.changesMade = false;
    }

    publishDataset () {
        this.datasetDetails2Service.publishDataset(this.state.dataset).then(() => this.onPublishDataset());
        // this.$mdDialog.show({
        //     templateUrl: 'app/modals/publish-dataset-dialog.html',
        //     controllerAs: '$ctrl',
        //     controller: PublishDatasetDialogController,
        //     bindToController: true,
        //     clickOutsideToClose: true,
        //     locals: {
        //         dataset: this.state.dataset
        //     }
        // }).then(() => this.onPublishDataset());
    }

    unpublishDataset () {
        this.datasetDetails2Service.unpublishDataset(this.state.dataset).then(() => this.onUnpublishDataset());
        // this.$mdDialog.show({
        //     templateUrl: 'app/modals/unpublish-dataset-dialog.html',
        //     controllerAs: '$ctrl',
        //     controller: UnpublishDatasetDialogController,
        //     bindToController: true,
        //     clickOutsideToClose: true,
        //     locals: {
        //         dataset: this.state.dataset
        //     }
        // }).then(
        //     () => this.onUnpublishDataset());
    }

    cancel() {
        this.changesMade = false;
        this.onCancel();
    }
}

angular.module('materialscommons').component('mcDatasetDetails2', {
    template: require('./mc-dataset-details2.html'),
    controller: MCDatasetDetails2ComponentController,
    bindings: {
        dataset: '<',
        onUpdateDataset: '&',
        onPublishDataset: '&',
        onAddPaper: '&',
        onAddAuthor: '&',
        onUnpublishDataset: '&',
        onAddDoi: '&',
        onCancel: '&',
    }
});

