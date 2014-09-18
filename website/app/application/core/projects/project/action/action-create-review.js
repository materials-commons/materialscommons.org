Application.Directives.directive('actionCreateReview', actionCreateReview);

function actionCreateReview() {
    return {
        scope: {
            project: "="
        },
        restrict: "AE",
        templateUrl: "application/core/projects/project/action/action-create-review.html"
    };
}
