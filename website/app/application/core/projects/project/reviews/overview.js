Application.Controllers.controller('projectReviewsOverview',
    ["$scope", "mcapi", "Review", projectReviewsOverview]);

function projectReviewsOverview($scope, mcapi, Review) {

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
            $scope.status = 'open';
        } else {
            $scope.status = 'closed';
        }
    };

    function init() {
        $scope.status = 'open';
    }
    init();
}
