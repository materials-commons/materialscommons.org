class MCExperimentOverviewComponentController {
    /*@ngInject*/
    constructor($scope, editorOpts) {
        $scope.editorOptions = editorOpts({height: 67, width: 41});
    }
}

angular.module('materialscommons').component('mcExperimentOverview', {
    templateUrl: 'app/project/home/mc-experiment-overview.html',
    controller: MCExperimentOverviewComponentController,
    bindings: {
        experiment: '<'
    }
});