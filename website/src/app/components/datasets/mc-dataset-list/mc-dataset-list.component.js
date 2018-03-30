class MCDatasetListComponentController {
    /*@ngInject*/
    constructor(mcbus) {
        this.mcbus = mcbus;
        this.myName = 'MCDatasetListComponentController';
    }

    $onInit() {
        this.mcbus.subscribe('MCDATA$SEARCH', this.myName, (query) => this.query = query);
    }

    $onDestroy() {
        this.mcbus.leave('MCDATA$SEARCH', this.myName);
    }

}

angular.module('materialscommons').component('mcDatasetList', {
    template: require('./mc-dataset-list.html'),
    controller: MCDatasetListComponentController,
    bindings: {
        datasets: '<',
        detailsRoute: '@'
    }
});

