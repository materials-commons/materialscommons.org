class MCDatasetListComponentController {
    /*@ngInject*/
    constructor(mcbus) {
        this.mcbus = mcbus;
        this.myName = 'MCDatasetListComponentController';
        console.log("MCDatasetListComponentController");
        console.log(this.datasets);
    }

    $onInit() {
        this.mcbus.subscribe('MCDATA$SEARCH', this.myName, (query) => this.query = query);
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