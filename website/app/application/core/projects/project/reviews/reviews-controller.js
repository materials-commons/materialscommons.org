Application.Controllers.controller('projectReviews',
    ["$scope", "project", "$filter", "Review", "pubsub", "User", "$state", "$stateParams", projectReviews]);

function projectReviews($scope, project, $filter, Review, pubsub, User, $state, $stateParams) {

    pubsub.waitOn($scope, 'activeReview.change', function () {
        $scope.review = Review.getActiveReview();
    });
    pubsub.waitOn($scope, 'reviews.change', function () {
        $scope.reviews = Review.getReviews();
    });
    $scope.listReviewsByType = function (type) {
        $scope.type = type;
        switch (type) {
            case "all":
                $scope.reviews = $filter('byKey')($scope.project.reviews, 'status', 'open');
                Review.listReviewsByType($scope.reviews, type);
                break;
            case "my_reviews":
                $scope.reviews = $filter('byKey')($scope.project.reviews, 'author', User.u());
                $scope.reviews = $filter('byKey')($scope.reviews, 'status', 'open');
                Review.listReviewsByType($scope.reviews, type);
                break;
            case "due":
                $scope.reviews = $filter('byKey')($scope.project.reviews, 'assigned_to', User.u());
                $scope.reviews = $filter('byKey')($scope.reviews, 'status', 'open');
                Review.listReviewsByType($scope.reviews, type);
                break;
            case "closed":
                $scope.reviews = $filter('byKey')($scope.project.reviews, 'status', 'closed');
                Review.listReviewsByType($scope.reviews, type);
                break;
        }
    };

    function init() {
        $scope.project = project;
        if ($stateParams.category === 'due') {
            $scope.listReviewsByType('due');
        } else if ($stateParams.category === 'closed') {
            $scope.listReviewsByType('closed');
        }
        else if ($stateParams.category === 'all') {
                $scope.listReviewsByType('all');
        } else {
            $stateParams.category = 'my_reviews';
            $scope.listReviewsByType('my_reviews');
        }
    }

    init();
}
