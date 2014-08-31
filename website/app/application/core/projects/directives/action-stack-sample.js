Application.Directives.directive('actionSample', actionSampleDirective);

function actionSampleDirective() {
    return {
        restrict: "A",
        templateUrl: "application/core/projects/directives/action-stack-sample.html"
    };
}
