Application.Directives.directive('showProcessRuns', showProcessRunsDirective);

function showProcessRunsDirective() {
    return {
        scope: {
            runs: "="
        },
        restrict: "AE",
        templateUrl: "application/core/projects/directives/provenance/show-process-runs.html"
    };
}
