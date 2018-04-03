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
    template: require('./mc-dataset-list-item.html'),
    controller: MCDatasetListItemComponentController,
    bindings: {
        dataset: '<',
        detailsRoute: '<'
    }
});
