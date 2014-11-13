Application.Controllers.controller("projectReviewsEdit",
    ["$scope", "project", "User", "$stateParams", "mcapi",  "dateGenerate","pubsub","$state", projectReviewsEdit]);

function projectReviewsEdit($scope, project, User, $stateParams, mcapi, dateGenerate, pubsub, $state) {
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
        var i = _.indexOf(project[which], function(review) {
            return review.id === reviewID;
        });
        return project[which][i];
    }
    function swapReview(reviewID, from, to) {
        var i = _.indexOf(project[from], function(review) {
            return review.id === reviewID;
        });
        if (i !== -1) {
            var r = project[from][i];
            project[from].splice(i, 1);
            project[to].push(r);
        }
    }
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
        mcapi('/reviews/%', $scope.review.id)
            .success(function (data) {
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
                $state.go('projects.project.reviews.overview');
            }).put({'status': 'closed'});
    };

    $scope.reOpenReview = function() {
        var reviewID = $scope.review.id;
        mcapi('/reviews/%', $scope.review.id)
            .success(function () {
                $scope.review = '';
                var review = findReview(reviewID, "closed_reviews");
                console.log(review);
                review.status = "open";
                swapReview(reviewID, "closed_reviews", "open_reviews");
                reviewCount();
                $state.go('projects.project.reviews.overview');
            }).put({'status': 'open'});
    };
    function reviewCount(){
        pubsub.send("reviews.change");
    }
    function init() {
        if ($stateParams.status === 'open') {
            $scope.review = $scope.project.open_reviews[$stateParams.index];
        } else {
            $scope.review = $scope.project.closed_reviews[$stateParams.index];
        }
    }

    init();
}
