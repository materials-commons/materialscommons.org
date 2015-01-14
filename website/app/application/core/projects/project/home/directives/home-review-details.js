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
    ["$scope", "Review", "current","$filter",
        homeReviewsDetailsDirectiveController]);
function homeReviewsDetailsDirectiveController($scope, Review, current, $filter) {
    $scope.addComment1 = function (review) {
        Review.addComment($scope.model, review);
        $scope.model.addComment = false;
    };

    $scope.closeReview = function (rev) {
        Review.closeReview(rev.id, current.project());
    };

    $scope.filterMessagesByWho = function(filter_by){
        $scope.model.filter_by = filter_by;
    };

    $scope.clearMessageFilter = function(){
        $scope.model.filter_by = '';
    };

    $scope.model = {
        comment: '',
        count: Review.countMessages($scope.review),
        addComment : false,
        filter_by: ''
    };
    $scope.clearMessageFilter();
}

