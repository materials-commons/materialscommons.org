class MCDatasetDetailsComponentController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
        this.authors = [
            {
                last_name: '',
                first_name: '',
                affiliation: ''
            }
        ];
        this.licenses = [
            {
                name: `Public Domain Dedication and License (PDDL)`,
                link: "http://opendatacommons.org/licenses/pddl/summary/"
            },
            {
                name: `Attribution License (ODC-By)`,
                link: "http://opendatacommons.org/licenses/by/summary/"
            },
            {
                name: `Open Database License (ODC-ODbL) `,
                link: "http://opendatacommons.org/licenses/odbl/summary/"
            }
        ];
    }

    addAuthor() {
        this.authors.push({
            last_name: '',
            first_name: '',
            affiliation: ''
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
