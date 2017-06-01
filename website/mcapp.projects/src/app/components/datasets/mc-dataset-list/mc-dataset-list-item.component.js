class MCDatasetListItemComponentController {
    /*@ngInject*/
    constructor() {

    }
}

angular.module('materialscommons').component('mcDatasetListItem', {
    templateUrl: 'app/components/datasets/mc-dataset-list/mc-dataset-list-item.html',
    controller: MCDatasetListItemComponentController,
    bindings: {
        dataset: '<'
    }
});