class MCDatasetListComponentController {
    /*@ngInject*/
    constructor(mcbus) {
        this.mcbus = mcbus;
        this.myName = 'MCDatasetListComponentController';
    }

    $onInit() {
        this.mcbus.subscribe('MCDATA$SEARCH', this.myName, (query) => this.query = query);
        for (let i = 0; i < this.datasets.length; i++) {
            // fake crowd curation attributes
            let dataset = this.datasets[i];
            let stats = {
                comment_count: dataset.comment_count,
                unique_view_count: {
                    authenticated: 4,
                    anonymous: 2
                },
                download_count: 8,
                favorite_count: 10
            };
            dataset.stats = stats;
        }
    }

    $onDestroy() {
        this.mcbus.leave('MCDATA$SEARCH', this.myName);
    }
}

angular.module('materialscommons').component('mcDatasetList', {
    templateUrl: 'app/components/datasets/mc-dataset-list/mc-dataset-list.html',
    controller: MCDatasetListComponentController,
    bindings: {
        datasets: '<',
        detailsRoute: '@'
    }
});

