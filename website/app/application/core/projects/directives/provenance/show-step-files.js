Application.Directives.directive('showStepFiles', showStepFilesDirective);

function showStepFilesDirective() {
    return {
        scope: {
            step: "=",
            templateId: "="
        },
        restrict: "EA",
        templateUrl: "application/core/projects/directives/provenance/show-step-files.html"
    };
}
