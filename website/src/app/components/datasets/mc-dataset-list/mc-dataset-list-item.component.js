class MCDatasetListItemComponentController {
    /*@ngInject*/
    constructor($state) {
        this.$state = $state;
    }

    gotoDetailsRoute() {
        this.$state.go(this.detailsRoute, {dataset_id: this.dataset.id});
    }

}

angular.module('materialscommons').component('mcDatasetListItem', {
    templateUrl: 'app/components/datasets/mc-dataset-list/mc-dataset-list-item.html',
    controller: MCDatasetListItemComponentController,
    bindings: {
        dataset: '<',
        detailsRoute: '<'
    }
});