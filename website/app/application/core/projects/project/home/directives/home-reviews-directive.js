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
    var showReviewDetails = [];
    for (var i = 0; i < $scope.project.notes.length; i++) {
        showReviewDetails.push(false);
    }
    $scope.toggleDetails = function(index) {
        showReviewDetails[index] = !showReviewDetails[index];
    };

    $scope.showDetails = function(index) {
        return showReviewDetails[index];
    };

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

}
