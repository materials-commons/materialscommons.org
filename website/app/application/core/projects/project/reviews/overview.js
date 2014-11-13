Application.Controllers.controller('projectReviewsOverview',
    ["$scope", "mcapi", "$filter", "dateGenerate", "User",
        "project", "pubsub", projectReviewsOverview]);

function projectReviewsOverview($scope, mcapi, $filter, dateGenerate,
                                User, project, pubsub) {

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

    $scope.showReviews = function (status) {
        if (status === "open") {
            $scope.reviews = project.open_reviews;
        } else {
            $scope.reviews = project.closed_reviews;
        }
    };

    function reviewCount() {
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
