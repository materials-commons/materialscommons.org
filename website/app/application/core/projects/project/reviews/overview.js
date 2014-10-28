Application.Controllers.controller('projectReviewsOverview',
                                   ["$scope", "mcapi", "$filter", "dateGenerate", "User",
                                    "project", "pubsub", projectReviewsOverview]);

function projectReviewsOverview($scope, mcapi, $filter, dateGenerate,
                                User, project, pubsub) {
    function findReview(reviewID, which) {
        var i = _.indexOf(project[which], function(review) {
            return review.id == reviewID;
        });
        return project[which][i];
    }

    function swapReview(reviewID, from, to) {
        var i = _.indexOf(project[from], function(review) {
            return review.id == reviewID;
        });
        if (i !== -1) {
            var r = project[from][i];
            project[from].splice(i, 1);
            project[to].push(r);
        }
    }

    $scope.viewReview = function (review) {
        $scope.model = {
            selected: false,
            comment: ""
        };
        mcapi('/reviews/%', review.id)
            .success(function (data) {
                $scope.highlight_review = review;
                $scope.review = data;
            }).jsonp();
    };

    $scope.editReview = function(index){
        $scope.edit_index = index;
    };

    $scope.saveReview = function(index) {
        if ($scope.review.messages[index].message === "") {
            return;
        }
        $scope.edit_index = -1;
        mcapi('/reviews/%', $scope.review.id)
            .success(function (data) {
            }).put({'messages': $scope.review.messages});
    };

    $scope.addComment = function() {
        if ($scope.model.comment.length === 0) {
            return;
        }

        var d = dateGenerate.new_date();
        $scope.review.messages.push({
            'message': $scope.model.comment,
            'who': User.u(),
            'date': d
        });
        var reviewID = $scope.review.id;
        mcapi('/reviews/%', $scope.review.id)
            .success(function (data) {
                var review = findReview(reviewID, "open_reviews");
                review.messages.push({
                    message: $scope.model.comment,
                    who: User.u(),
                    date: d
                });
            }).put({'messages': $scope.review.messages});
    };

    $scope.closeReview = function() {
        var reviewID = $scope.review.id;
        mcapi('/reviews/%', $scope.review.id)
            .success(function () {
                $scope.review = '';
                var review = findReview(reviewID, "open_reviews");
                review.status = "closed";
                swapReview(reviewID, "open_reviews", "closed_reviews");
                reviewCount();
            }).put({'status': 'closed'});
    };

    $scope.reOpenReview = function() {
        var reviewID = $scope.review.id;
        mcapi('/reviews/%', $scope.review.id)
            .success(function () {
                $scope.review = '';
                var review = findReview(reviewID, "closed_reviews");
                review.status = "open";
                swapReview(reviewID, "closed_reviews", "open_reviews");
                reviewCount();
            }).put({'status': 'open'});
    };

    $scope.showReviews = function (status) {
        if (status == "open") {
            $scope.reviews = project.open_reviews;
        } else {
            $scope.reviews = project.closed_reviews;
        }
    };

    function reviewCount(){
        pubsub.send("reviews.change");
    }

    function init() {
        $scope.review = '';
        $scope.project = project;
        reviewCount();

        $scope.reviews = project.open_reviews;

        $scope.model = {
            new_review: "",
            assigned_to: "",
            title: ""
        };
    }

    init();
}
