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
                if ($scope.reviews.length > 0) {
                    Review.setActiveReview($scope.reviews[0]);
                    $state.go('projects.project.reviews.edit', {category: 'all', review_id: $scope.reviews[0].id});
                }
                break;
            case "due":
                $scope.reviews = $filter('byKey')($scope.project.reviews, 'assigned_to', User.u());
                if ($scope.reviews.length > 0) {
                    Review.setActiveReview($scope.reviews[0]);
                    $state.go('projects.project.reviews.edit', {category: 'due', review_id: $scope.reviews[0].id});
                }
                break;
            case "closed":
                $scope.reviews = $filter('byKey')($scope.project.reviews, 'status', 'closed');
                if ($scope.reviews.length > 0) {
                    Review.setActiveReview($scope.reviews[0]);
                    $state.go('projects.project.reviews.edit', {category: 'closed', review_id: $scope.reviews[0].id});
                }
                break;
        }
    };

    function init() {
        $scope.project = project;
        if ($stateParams.category === 'due') {
            $scope.listReviewsByType('due');
        } else if ($stateParams.category === 'closed') {
            $scope.listReviewsByType('closed');
        } else if ($stateParams.category === 'all') {
            $scope.listReviewsByType('all');
        } else {
            $stateParams.category = 'all';
            $scope.listReviewsByType('all');
        }
    }

    init();
}
