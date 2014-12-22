Application.Directives.directive("processesSideboard", processesSideboardDirective);
function processesSideboardDirective() {
    return {
        restrict: "AE",
        replace: true,
        controller: 'sideboardController',
        templateUrl: "application/core/projects/project/provenance/processes-sideboard.html"
    };
}
