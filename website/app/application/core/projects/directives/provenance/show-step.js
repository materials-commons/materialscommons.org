Application.Directives.directive('showStep', showStepDirective);

function showStepDirective() {
    return {
        scope: {
            step: "=",
            templateId: "=",
            template: "="
        },
        restrict: "EA",
        templateUrl: "application/core/projects/directives/provenance/show-step.html"
    };
}
