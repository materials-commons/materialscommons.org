Application.Controllers.controller('reviewsController',
    ["$scope", "mcapi", "User", "alertService",
        "dateGenerate", "pubsub", "$filter", "$state",reviewsController]);

function reviewsController ($scope, mcapi, User, alertService, dateGenerate, pubsub, $filter, $state) {

    $scope.viewReview = function (review) {
        $state.go('projects.overview.editreviews', {'review_id': review.id});
    };

    $scope.showReviews = function (status) {
        $scope.status = status;
        if (status == 'open') {
            $scope.list_reviews = $scope.open_reviews;
        }
        else if (status == 'close') {
            $scope.list_reviews = $scope.closed_reviews;
        }
    };

    $scope.loadReviews = function (id) {
        mcapi('/project/%/reviews', id)
            .success(function (reviews) {
                $scope.open_reviews = $filter('reviewFilter')(reviews, 'open');
                $scope.closed_reviews = $filter('reviewFilter')(reviews, 'close');
                $scope.list_reviews = $scope.open_reviews;
                $scope.status = 'open';
            }).jsonp();

    };
    function init() {
        mcapi('/projects/%', $scope.projectId)
            .success(function (data) {
                $scope.project = data;
            }).jsonp();
        $scope.loadReviews($scope.projectId);
        $scope.model = {
            new_review: "",
            assigned_to: "",
            title: ""
        };
        mcapi('/selected_users')
            .success(function (data) {
                $scope.users = data;
            }).jsonp();
    }

    init();
}

Application.Directives.directive('reviews', notesDirective);
function notesDirective () {
    return {
        restrict: "A",
        controller: "reviewsController",
        scope: {
            projectId: "="
        },
        templateUrl: 'application/directives/reviews.html'
    };
}
