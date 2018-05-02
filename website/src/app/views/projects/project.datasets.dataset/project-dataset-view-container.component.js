class MCProjectDatasetViewContainerComponentController {
    /*@ngInject*/
    constructor($stateParams, mcdsstore) {
        this.$stateParams = $stateParams;
        this.mcdsstore = mcdsstore;
        this.state = {
            dataset: null
        };
    }

    $onInit() {
        this.state.dataset = angular.copy(this.mcdsstore.getDataset(this.$stateParams.dataset_id));
        if (!this.state.dataset.files || !this.state.dataset.files.length) {
            this.state.dataset.files = [
                {
                    selected: false,
                    id: 1,
                    name: 'hardeningdata.xls',
                    path: 'project1/hardening tests',
                    samples: 'E1XKG'
                },
                {
                    selected: false,
                    id: 2,
                    name: 'crack.tiff',
                    path: 'project1/hardening tests',
                    samples: 'S1XKG'
                },
                {
                    selected: false,
                    id: 3,
                    name: 'sem.odg',
                    path: 'project1/sem runs/hardening',
                    samples: 'S1XKG_400'
                },
                {
                    selected: false,
                    id: 4,
                    name: 'sem graphs.xls',
                    path: 'project1/sem runs/hardening',
                    samples: 'S1XKG_400'
                },
                {
                    selected: false,
                    id: 5,
                    name: 'final_results.xls',
                    path: 'project1/hardening tests/results',
                    samples: 'S1XKG, S1XKG_400'
                },
                {
                    selected: false,
                    id: 6,
                    name: 'final_results_22.xls',
                    path: 'project1/hardening tests/results',
                    samples: 'S1XKG, S1XKG_400'
                },
            ];
        }
    }

    handleDeleteFiles(filesToDelete) {
        // Figure out if this object needs to keep track of changes
        // let filesMap = _.indexBy(filesToDelete, 'id');
        // this.state.dataset.files = this.state.dataset.files.filter(f => (!(f.id in filesMap)));
    }
}

angular.module('materialscommons').component('mcProjectDatasetViewContainer', {
    template: `
        <mc-project-dataset-view dataset="$ctrl.state.dataset" layout-fill ng-if="$ctrl.state.dataset">
        </mc-project-dataset-view>`,
    controller: MCProjectDatasetViewContainerComponentController
});