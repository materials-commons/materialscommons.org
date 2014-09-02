Application.Directives.directive('actionTag', actionTagDirective);

function actionTagDirective() {
    return {
        restrict: "A",
        templateUrl: "application/core/projects/directives/action-stack-tag.html"
    };
}
