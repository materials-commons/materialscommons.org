Application.Directives.directive("showProcessSample", showProcessSampleDirective);
function showProcessSampleDirective() {
    return {
        scope: {
            sample: "=sample"
        },
        restrict: "AE",
        replace: true,
        templateUrl: "application/core/projects/project/provenance/show-process-sample.html"
    };
}
