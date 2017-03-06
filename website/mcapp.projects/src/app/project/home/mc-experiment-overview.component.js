class MCExperimentOverviewComponentController {
    /*@ngInject*/
    constructor($scope, editorOpts) {
        $scope.editorOptions = editorOpts({});
    }
}

angular.module('materialscommons').component('mcExperimentOverview', {
    templateUrl: 'app/project/home/mc-experiment-overview.html',
    controller: MCExperimentOverviewComponentController,
    bindings: {
        experiment: '<'
    }
});