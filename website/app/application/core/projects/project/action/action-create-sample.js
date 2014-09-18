Application.Directives.directive('actionCreateSample', actionCreateSample);

function actionCreateSample() {
    return {
        scope: {
            project: "="
        },
        restrict: "AE",
        templateUrl: "application/core/projects/project/action/action-create-sample.html"
    };
}
