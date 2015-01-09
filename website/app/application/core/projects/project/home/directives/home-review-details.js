Application.Directives.directive("homeReviewDetails", homeReviewDetailsDirective);
function homeReviewDetailsDirective() {
    return {
        restrict: "AE",
        controller: 'homeReviewsDetailsDirectiveController',
        scope: true,
        replace: true,
        templateUrl: "application/core/projects/project/home/directives/home-review-details.html"
    };
}

Application.Controllers.controller("homeReviewsDetailsDirectiveController",
    ["$scope", "Review", "current",
        homeReviewsDetailsDirectiveController]);
function homeReviewsDetailsDirectiveController($scope, Review, current) {
    $scope.addComment1 = function (review) {
        Review.addComment($scope.model, review);
        $scope.addComment = false;
    };

    $scope.closeReview = function (rev) {
        Review.closeReview(rev.id, current.project());
    };

    $scope.model = {
        comment: ''
    };
    $scope.addComment = false;
}

