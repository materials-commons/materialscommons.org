class MCDatasetDetailsComponentController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
        this.authors = [
            {
                last_name: '',
                first_name: '',
                affilliation: ''
            }
        ];
    }

    addAuthor() {
        this.authors.push({
            last_name: '',
            first_name: '',
            affilliation: ''
        });
    }

    removeAuthor(index) {
        this.authors.splice(index, 1);
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

angular.module('materialscommons').component('mcDatasetDetails', {
    templateUrl: 'app/project/experiments/experiment/components/dataset/components/mc-dataset-details.html',
    controller: MCDatasetDetailsComponentController,
    bindings: {
        dataset: '<'
    }
});
