Application.Controllers.controller('projectReviews',
    ["$scope", "project", "$filter", "Review", "pubsub", "User", projectReviews]);

function projectReviews($scope, project, $filter, Review, pubsub, User) {

    pubsub.waitOn($scope, 'review.change', function () {
        $scope.review = Review.getActiveReview();
    });

    $scope.project = project;

    $scope.listReviewsByType = function (type) {
        $scope.type = type;
        switch (type) {
            case "all_reviews":
                $scope.reviews = $scope.project.reviews;
                break;
            case "my_reviews":
                $scope.reviews = $filter('byKey')($scope.project.reviews, 'author', User.u());
                break;
            case "closed_reviews":
                $scope.reviews = $filter('byKey')($scope.project.reviews, 'status', 'closed');
                break;
        }
    };
    $scope.reviews = $scope.project.reviews;
}
