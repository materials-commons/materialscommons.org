Application.Directives.directive("homeReviewDetails", homeReviewDetailsDirective);
function homeReviewDetailsDirective() {
    return {
        restrict: "AE",
        scope: true,
        replace: true,
        templateUrl: "application/core/projects/project/home/directives/home-review-details.html"
    };
}
