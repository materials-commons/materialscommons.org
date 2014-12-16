Application.Controllers.controller("projectReviewsEdit",
    ["$scope", "project", "User", "$stateParams", "mcapi", "pubsub", "$state", "Review", projectReviewsEdit]);

function projectReviewsEdit($scope, project, User, $stateParams, mcapi, pubsub, $state, Review) {
    $scope.project = project;

    $scope.editReview = function (index) {
        $scope.edit_index = index;
    };

    $scope.saveReview = function (index) {
        if ($scope.review.messages[index].message === "") {
            return;
        }
        $scope.edit_index = -1;
        mcapi('/reviews/%', $scope.review.id)
            .success(function (data) {
            }).put({'messages': $scope.review.messages});
    };

    function findReview(reviewID, which) {
        var i = _.indexOf(project[which], function (review) {
            return review.id === reviewID;
        });
        return project[which][i];
    }

    $scope.addComment = function () {
        if ($scope.model.comment.length === 0) {
            return;
        }

        var d = new Date();
        $scope.review.messages.push({
            'message': $scope.model.comment,
            'who': User.u(),
            'date': d.toDateString()
        });
        mcapi('/reviews/%', $scope.review.id)
            .success(function (data) {
            }).put({'messages': $scope.review.messages});
    };
    $scope.closeReview = function () {
        var reviewID = $scope.review.id;
        mcapi('/reviews/%', $scope.review.id)
            .success(function () {
                $scope.review = '';
                var review = findReview(reviewID, "reviews");
                review.status = "closed";
                reviewCount();
                $state.go('projects.project.reviews.overview');
            }).put({'status': 'closed'});
    };

    $scope.reOpenReview = function () {
        var reviewID = $scope.review.id;
        mcapi('/reviews/%', $scope.review.id)
            .success(function () {
                $scope.review = '';
                var review = findReview(reviewID, "reviews");
                review.status = "open";
                reviewCount();
                $state.go('projects.project.reviews.overview');
            }).put({'status': 'open'});
    };

    function reviewCount() {
        pubsub.send("reviews.change");
    }

    function init() {
        var review_id = $stateParams.review_id;
        if ($stateParams.status === 'open') {
            $scope.reviews = Review.getReviews('open');
        } else {
            $scope.reviews = Review.getReviews('closed');
        }
        $scope.review = Review.findReview(review_id, 'reviews', project);
    }

    init();
}
