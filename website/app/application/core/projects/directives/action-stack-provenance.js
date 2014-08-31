Application.Directives.directive('actionProvenance', actionProvenanceDirective);

function actionProvenanceDirective() {
    return {
        restrict: "A",
        templateUrl: "application/core/projects/directives/action-stack-provenance.html"
    };
}
