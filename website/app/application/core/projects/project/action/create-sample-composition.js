Application.Directives.directive("createSampleComposition", createSampleCompositionDirective);

function createSampleCompositionDirective() {
    return {
        replace: true,
        restrict: "AE",
        templateUrl: "application/core/projects/project/action/create-sample-composition.html"
    };
}
