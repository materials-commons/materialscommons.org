(function (module) {
    module.controller('projectReviews', projectReviews);
    projectReviews.$inject = ["$scope", "project", "pubsub", "Review", "reviews", "User", "$filter", "$stateParams"];

    function projectReviews($scope, project, pubsub, Review, reviews, User, $filter, $stateParams) {
        var ctrl = this;

        ctrl.reviews = reviews;
        ctrl.project = project;
        ctrl.listReviewsByType = listReviewsByType;
        ctrl.category = $stateParams.category;

        listReviewsByType($stateParams.category);


        pubsub.waitOn($scope, 'activeReview.change', function () {
            ctrl.review = Review.getActiveReview();
        });

        pubsub.waitOn($scope, 'reviews.change', function () {
            ctrl.reviews = Review.getReviews();
        });

        function listReviewsByType(type) {
            switch (type) {
            case "all":
                ctrl.reviews = $filter('byKey')(ctrl.project.reviews, 'status', 'open');
                Review.listReviewsByType(ctrl.reviews, type);
                ctrl.noReviewsMessage = "No reviews of any type";
                break;
            case "my_reviews":
                ctrl.reviews = $filter('byKey')(ctrl.project.reviews, 'author', User.u());
                ctrl.reviews = $filter('byKey')(ctrl.reviews, 'status', 'open');
                Review.listReviewsByType(ctrl.reviews, type);
                ctrl.noReviewsMessage = "You have no open reviews";
                break;
            case "due":
                ctrl.reviews = $filter('byKey')(ctrl.project.reviews, 'assigned_to', User.u());
                ctrl.reviews = $filter('byKey')(ctrl.reviews, 'status', 'open');
                Review.listReviewsByType(ctrl.reviews, type);
                ctrl.noReviewsMessage = "You have no reviews due";
                break;
            case "closed":
                ctrl.reviews = $filter('byKey')(ctrl.project.reviews, 'status', 'closed');
                Review.listReviewsByType(ctrl.reviews, type);
                ctrl.noReviewsMessage = "There are no archived reviews";
                break;
            default:
                ctrl.reviews = $filter('byKey')(ctrl.project.reviews, 'status', 'open');
                Review.listReviewsByType(ctrl.reviews, 'all');
                ctrl.noReviewsMessage = "No reviews of any type";
                break;
            }
        }

    }

}(angular.module('materialscommons')));
