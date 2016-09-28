(function (module) {
    module.controller('projectReviews', projectReviews);
    projectReviews.$inject = ["$scope", "project", "pubsub", "Review", "reviews", "User", "$filter"];

    function projectReviews($scope, project, pubsub, Review, reviews, User, $filter) {
        var ctrl = this;

        ctrl.reviews = reviews;
        ctrl.project = project;
        ctrl.listReviewsByType = listReviewsByType;

        listReviewsByType();


        pubsub.waitOn($scope, 'activeReview.change', function () {
            ctrl.review = Review.getActiveReview();
        });

        pubsub.waitOn($scope, 'reviews.change', function () {
            ctrl.reviews = Review.getReviews();
        });

        function listReviewsByType(type) {
            switch (type) {
            case "all":
                ctrl.category = type;
                ctrl.reviews = $filter('byKey')(ctrl.project.reviews, 'status', 'open');
                Review.listReviewsByType(ctrl.reviews, type);
                ctrl.noReviewsMessage = "No reviews of any type";
                break;
            case "my_reviews":
                ctrl.category = type;
                var reviews = $filter('byKey')(ctrl.project.reviews, 'author', User.u());
                ctrl.reviews = $filter('byKey')(reviews, 'status', 'open');
                Review.listReviewsByType(ctrl.reviews, type);
                ctrl.noReviewsMessage = "You have no open reviews";
                break;
            case "due":
                ctrl.category = type;
                var reviews = $filter('byKey')(ctrl.project.reviews, 'assigned_to', User.u());
                ctrl.reviews = $filter('byKey')(reviews, 'status', 'open');
                Review.listReviewsByType(ctrl.reviews, type);
                ctrl.noReviewsMessage = "You have no reviews due";
                break;
            case "closed":
                ctrl.category = type;
                ctrl.reviews = $filter('byKey')(ctrl.project.reviews, 'status', 'closed');
                Review.listReviewsByType(ctrl.reviews, type);
                ctrl.noReviewsMessage = "There are no archived reviews";
                break;
            default:
                ctrl.category = 'all';
                ctrl.reviews = $filter('byKey')(ctrl.project.reviews, 'status', 'open');
                Review.listReviewsByType(ctrl.reviews, 'all');
                ctrl.noReviewsMessage = "No reviews of any type";
                break;
            }
        }

    }

}(angular.module('materialscommons')));
