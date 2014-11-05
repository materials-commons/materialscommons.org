Application.Directives.directive("overviewShowProcessDetails", overviewShowProcessDetailsDirective);

function overviewShowProcessDetailsDirective() {
    return {
        restrict: "EA",
        templateUrl: "application/core/projects/project/provenance/overview-show-process-details.html",
        replace: true
    };
}
