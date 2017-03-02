class MCProjectOverviewComponentController {
    /*@ngInject*/
    constructor(editorOpts, $scope) {
        $scope.editorOptions = editorOpts({height: 15, width: 40});
    }
}

angular.module('materialscommons').component('mcProjectOverview', {
    templateUrl: 'app/global.components/mc-project-overview.html',
    controller: MCProjectOverviewComponentController,
    bindings: {
        project: '<'
    }
});