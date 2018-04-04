class ProjectDatasetsViewService {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    createNewDataset() {
        return this.$mdDialog.show({
            templateUrl: 'app/modals/create-new-dataset-dialog.html',
            controller: CreateNewDatasetDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
        });
    }
}

angular.module('materialscommons').service('projectDatasetsViewService', ProjectDatasetsViewService);

class CreateNewDatasetDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
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
        return this.$mdDialog.hide({
            name: 'DS Created',
            owner: 'Glenn Tarcea',
            experiments: ['My Experiment'],
            samples_count: 2,
            files_count: 0,
            published: false,
        });
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}