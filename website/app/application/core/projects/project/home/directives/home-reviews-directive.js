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
                                   ["$scope","mcapi", "Review",
                                    homeReviewsDirectiveController]);
function homeReviewsDirectiveController ($scope, mcapi, Review) {
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
        mcapi('/reviews/%', $scope.cached_review.id)
            .success(function () {
                $scope.project.reviews[$scope.index].status = 'closed';
            }).put({'status': 'closed'});
    };
    $scope.cacheReview = function (review, index) {
       $scope.cached_review = review;
       $scope.index = index;
    };
}
