class MCProjectDatasetsComponentController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;

        this.datasets = [
            {
                name: 'DS1',
                owner: 'John Allison',
                experiments: ['E1', 'Stress testing of dilution factors'],
                samples_count: 5,
                files_count: 100,
                published: false
            },
            {
                name: 'DS2',
                owner: 'John Allison',
                experiments: ['long name 1', 'experiment test 2'],
                samples_count: 20,
                files_count: 1001,
                published: true
            },
            {
                name: 'DS3',
                owner: 'Brian Puchala',
                experiments: ['computational and DFT processes combined with casm', 'Hardness testing with Professor Allison'],
                samples_count: 15,
                files_count: 657,
                published: false
            },
            {
                name: 'DS4',
                owner: 'Tracy Berman',
                experiments: ['LIFT Anodized metals', 'My Postdoc research'],
                samples_count: 50,
                files_count: 150,
                published: true
            },
        ]
    }

    createNewDataset() {
        this.$mdDialog.show({
            templateUrl: 'app/modals/create-new-dataset-dialog.html',
            controller: CreateNewDatasetDialogController,
            controllerAs: '$ctrl',
            bindToController: true
        });
    }
}

class CreateNewDatasetDialogController {
    /*@ngInject*/
    constructor($mdDialog, $state) {
        this.$mdDialog = $mdDialog;
        this.$state = $state;
        this.experiments = [
            {
                selected: false,
                name: 'Experiment 1',
                owner: 'John Allison',
                files_count: 100,
                samples_count: 30
            },
            {
                selected: false,
                name: 'Experiment 2',
                owner: 'Tracy Berman',
                files_count: 500,
                samples_count: 22
            },
            {
                selected: false,
                name: 'Experiment 3',
                owner: 'Brian Puchala',
                files_count: 100000,
                samples_count: 300
            },
        ];

        this.samples = [
            {
                selected: false,
                name: 'S1',
                files_count: 1,
                process_count: 10,
            },
            {
                selected: false,
                name: 'S2',
                files_count: 5,
                process_count: 15,
            },
            {
                selected: false,
                name: 'S3',
                files_count: 0,
                process_count: 5,
            },
            {
                selected: false,
                name: 'S4',
                files_count: 12,
                process_count: 8,
            },
            {
                selected: false,
                name: 'S5',
                files_count: 1,
                process_count: 1,
            },
        ]
    }

    done() {
        this.$mdDialog.hide();
        this.$state.go('project.datasets.dataset2');
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

angular.module('materialscommons').component('mcProjectDatasets', {
    template: require('./mc-project-datasets.html'),
    controller: MCProjectDatasetsComponentController
});
