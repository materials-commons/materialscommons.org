Application.Directives.directive('homeReviews', homeReviewsDirective);
function homeReviewsDirective () {
    return {
        restrict: "EA",
        controller: 'homeReviewsDirectiveController',
        scope: {
            project: '=project'
        },
        templateUrl: 'application/core/projects/project/home/directives/home-reviews.html'
    };
}

Application.Controllers.controller("homeReviewsDirectiveController",
                                   ["$scope", "Review", "ui",
                                    homeReviewsDirectiveController]);
function homeReviewsDirectiveController ($scope, Review, ui) {
    $scope.project.reviews.forEach(function(review) {
        if (!('showDetails' in review)) {
            review.showDetails = false;
        }
    });

    $scope.closeReview = function () {
        Review.closeReview($scope.cached_review.id, $scope.project);
    };

    $scope.cacheReview = function (review) {
        $scope.cached_review = review;
    };

    $scope.toggleExpanded = function() {
        ui.toggleIsExpanded($scope.project.id, "reviews");
    };

    $scope.isExpanded = function() {
        return ui.isExpanded($scope.project.id, "reviews");
    };

    $scope.createReview = function(){
        $scope.bk.createReview = true;
    };

    $scope.bk = {
        createReview: false
    };

}
