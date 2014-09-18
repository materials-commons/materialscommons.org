Application.Directives.directive('actionCreateProvenance', actionCreateProvenance);

function actionCreateProvenance() {
    return {
        scope: {
            project: "="
        },
        controller: "actionCreateProvenanceController",
        restrict: "AE",
        templateUrl: "application/core/projects/project/action/action-create-provenance.html"
    };
}

Application.Controllers.controller('actionCreateProvenanceController',
                                   ["$scope", actionCreateProvenanceController]);

function actionCreateProvenanceController($scope) {
    console.log("actionCreateProvenanceController");
}
