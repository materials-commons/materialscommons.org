Application.Directives.directive('showProcessRuns', showProcessRunsDirective);

function showProcessRunsDirective() {
    return {
        scope: {
            runDates: "="
        },
        restrict: "AE",
        templateUrl: "application/core/projects/directives/provenance/show-process-runs.html"
    };
}
