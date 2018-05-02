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
        if (!this.state.dataset.files.length) {
            this.state.dataset.files = [
                {
                    selected: false,
                    name: 'hardeningdata.xls',
                    path: 'project1/hardening tests',
                    samples: 'E1XKG'
                },
                {
                    selected: false,
                    name: 'crack.tiff',
                    path: 'project1/hardening tests',
                    samples: 'S1XKG'
                },
                {
                    selected: false,
                    name: 'sem.odg',
                    path: 'project1/sem runs/hardening',
                    samples: 'S1XKG_400'
                },
                {
                    selected: false,
                    name: 'sem graphs.xls',
                    path: 'project1/sem runs/hardening',
                    samples: 'S1XKG_400'
                },
                {
                    selected: false,
                    name: 'final_results.xls',
                    path: 'project1/hardening tests/results',
                    samples: 'S1XKG, S1XKG_400'
                },
            ]
        }
    }
}

angular.module('materialscommons').component('mcProjectDatasetViewContainer', {
    template: `
        <mc-project-dataset-view dataset="$ctrl.state.dataset" layout-fill ng-if="$ctrl.state.dataset">
        </mc-project-dataset-view>`,
    controller: MCProjectDatasetViewContainerComponentController
});