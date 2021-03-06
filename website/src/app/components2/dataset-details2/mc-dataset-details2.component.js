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

    $onInit() {
        this.state.dataset = angular.copy(this.dataset);
        if (this.$window.location.hostname === 'mcdev.localhost') {
            let port = this.$window.location.port;
            this.state.publishedLink = `http://mctest.localhost:${port}/#/data/dataset/${this.state.dataset.id}`;
        } else {
            let hostname = this.$window.location.hostname;
            this.state.publishedLink = `https://${hostname}/mcapp/#/data/dataset/${this.state.dataset.id}`;
        }
    }

    $onChanges(changes) {
        if (changes.dataset) {
            this.state.dataset = angular.copy(changes.dataset.currentValue);
        }
    }

    $onDestroy() {
        if (this.changesMade) {
            this.updateDataset();
        }
    }

    addAuthor() {
        this.datasetDetails2Service.addAuthor(this.state.dataset).then(author => {
            this.updateDataset().then(() => this.onAddAuthor({author: author}));
        });
    }

    removeAuthor(index) {
        this.state.dataset.authors.splice(index, 1);
        this.changesMade = true;
    }

    addPaper() {
        this.datasetDetails2Service.addPaper(this.state.dataset).then(paper => {
            this.updateDataset().then(() => this.onAddPaper({paper: paper}));
        });
    }

    removePaper(index) {
        this.state.dataset.papers.splice(index, 1);
        this.changesMade = true;
    }

    changed() {
        this.changesMade = true;
    }

    addDoi() {
        this.datasetDetails2Service.addDoi(this.state.dataset).then(doiDetails => {
            this.updateDataset().then(() => this.onAddDoi({doiDetails: doiDetails}));
        });
    }

    updateDataset() {
        return this.onUpdateDataset({dataset: this.state.dataset}).then(() => this.changesMade = false);
    }

    publishPublicDataset() {
        this.datasetDetails2Service.publishDataset(this.state.dataset).then(() => {
            this.updateDataset().then(() => this.onPublishDataset());
        });
    }

    publishPrivateDataset() {
        this.onPublishPrivateDataset();
    }

    unpublishDataset() {
        this.datasetDetails2Service.unpublishDataset(this.state.dataset).then(() => {
            this.updateDataset().then(() => this.onUnpublishDataset());
        });
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
        onPublishPrivateDataset: '&',
        onAddPaper: '&',
        onAddAuthor: '&',
        onUnpublishDataset: '&',
        onAddDoi: '&',
        onCancel: '&',
    }
});

