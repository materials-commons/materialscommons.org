Application.Controllers.controller('projectReviews',
    ["$scope", "project", "$filter", "Review", "pubsub", "User", "$state", projectReviews]);

function projectReviews($scope, project, $filter, Review, pubsub, User, $state) {

    pubsub.waitOn($scope, 'review.change', function () {
        $scope.review = Review.getActiveReview();
    });

    $scope.listReviewsByType = function (type) {
        $scope.type = type;
        switch (type) {
            case "all_reviews":
                $scope.reviews = $scope.project.reviews;
                if ($scope.project.reviews.length > 0) {
                    $state.go('projects.project.reviews.edit', {review_id: $scope.reviews[0].id});
                }
                break;
            case "my_reviews":
                $scope.reviews = $filter('byKey')($scope.project.reviews, 'author', User.u());
                if ($scope.project.reviews.length > 0) {
                    $state.go('projects.project.reviews.edit', {review_id: $scope.reviews[0].id});
                }
                break;
            case "closed_reviews":
                $scope.reviews = $filter('byKey')($scope.project.reviews, 'status', 'closed');
                if ($scope.project.reviews.length > 0) {
                    $state.go('projects.project.reviews.edit', {review_id: $scope.reviews[0].id});
                }
                break;
        }
    }

    function init() {
        $scope.project = project;
        $scope.listReviewsByType('all_reviews');
    }

    init();
}
