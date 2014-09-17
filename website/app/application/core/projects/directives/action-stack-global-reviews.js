Application.Directives.directive('actionGlobalReviews', actionReviewsDirective);

function actionReviewsDirective() {
    return {
        controller: "actionGlobalReviewsController",
        restrict: "A",
        templateUrl: "application/core/projects/directives/action-stack-global-reviews.html"
    };
}

Application.Controllers.controller('actionGlobalReviewsController',
    ["$scope", "review", "mcapi", "$filter", "pubsub", "User", "dateGenerate", "model.projects", actionGlobalReviewsController]);

function actionGlobalReviewsController($scope, review, mcapi, $filter, pubsub, User, dateGenerate, Projects) {

    function init() {
        $scope.review = '';
        review.loadReviews();
        $scope.reviews = review.getReviews();
        $scope.to_conduct = $filter('byKey')($scope.reviews, 'assigned_to', User.u());
        $scope.to_conduct_open = $filter('byKey')($scope.reviews, 'status', 'open');
        $scope.to_conduct_closed = $filter('byKey')($scope.reviews, 'status', 'close');
        $scope.requested = $filter('byKey')($scope.reviews, 'author', User.u());
        $scope.requested_open = $filter('byKey')($scope.reviews, 'status', 'open');
        $scope.requested_closed = $filter('byKey')($scope.reviews, 'status', 'close');


    }

    init();
}
