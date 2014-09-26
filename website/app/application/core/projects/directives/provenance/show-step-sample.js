Application.Directives.directive('showStepSample', showStepSampleDirective);

function showStepSampleDirective() {
    return {
        scope: {
            step: "=",
            templateId: "="
        },
        restrict: "EA",
        templateUrl: "application/core/projects/directives/provenance/show-step-sample.html"
    };
}
