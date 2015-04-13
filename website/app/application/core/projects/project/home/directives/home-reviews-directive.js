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
                                   ["$scope",  "ui",
                                    homeReviewsDirectiveController]);
function homeReviewsDirectiveController ($scope, ui) {
    $scope.project.reviews.forEach(function(review) {
        if (!('showDetails' in review)) {
            review.showDetails = false;
        }
    });

    $scope.minimize = function() {
        ui.togglePanelState($scope.project.id, 'reviews');
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

    $scope.splitScreen = function(what, col){
        ui.toggleColumns($scope.project.id, what, col);
    };

    $scope.isSplitExpanded = function () {
        return ui.getSplitStatus($scope.project.id);
    };

}
