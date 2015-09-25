(function (module) {
    module.controller('projectReviews', projectReviews);
    projectReviews.$inject = ["$scope", "project", "$filter", "Review", "pubsub", "User", "$stateParams"];

    function projectReviews($scope, project, $filter, Review, pubsub, User, $stateParams) {

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
                $scope.noReviewsMessage = "No reviews of any type";
                break;
            case "my_reviews":
                $scope.reviews = $filter('byKey')($scope.project.reviews, 'author', User.u());
                $scope.reviews = $filter('byKey')($scope.reviews, 'status', 'open');
                Review.listReviewsByType($scope.reviews, type);
                $scope.noReviewsMessage = "You have no open reviews";
                break;
            case "due":
                $scope.reviews = $filter('byKey')($scope.project.reviews, 'assigned_to', User.u());
                $scope.reviews = $filter('byKey')($scope.reviews, 'status', 'open');
                Review.listReviewsByType($scope.reviews, type);
                $scope.noReviewsMessage = "You have no reviews due";
                break;
            case "closed":
                $scope.reviews = $filter('byKey')($scope.project.reviews, 'status', 'closed');
                Review.listReviewsByType($scope.reviews, type);
                $scope.noReviewsMessage = "There are no archived reviews";
                break;
            }
        };

        function init() {
            $scope.project = project;
            $scope.listReviewsByType($stateParams.category === "" ? 'my_reviews' : $stateParams.category);
        }

        init();
    }

}(angular.module('materialscommons')));
