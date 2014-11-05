Application.Directives.directive("overviewProcessList", overviewProcessListDirective);

function overviewProcessListDirective() {
    return {
        restrict: "EA",
        templateUrl: "application/core/projects/project/provenance/overview-process-list.html",
        replace: true
    };
}
