class MCDatasetOverviewSummaryComponentController {
    /*@ngInject*/
    constructor(User) {
        this.isAuthenticated = User.isAuthenticated();
    }
}

angular.module('materialscommons').component('mcDatasetOverviewSummary', {
    template: require('./mc-dataset-overview-summary.html'),
    controller: MCDatasetOverviewSummaryComponentController,
    bindings: {
        dataset: '<',
        onDownloadRequest: '&'
    }
});
