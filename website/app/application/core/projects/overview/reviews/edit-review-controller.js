Application.Controllers.controller('projectsOverviewEditReview',
                                   ["$scope", "mcapi", "User", "$stateParams",
                                    "dateGenerate", "$state", "pubsub", projectsOverviewEditReview]);
function projectsOverviewEditReview ($scope, mcapi, User, $stateParams, dateGenerate, $state, pubsub) {

    $scope.editReview = function(index){
        $scope.edit_index = index;
    };

    $scope.saveReview = function(index) {
        if ($scope.review.messages[$scope.index].message === "") {
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
        $scope.review.messages.push({'message': $scope.model.comment, 'who': User.u(), 'date': dateGenerate.new_date()});
        mcapi('/reviews/%', $scope.review.id)
            .success(function (data) {
            }).put({'messages': $scope.review.messages});
    };

    $scope.closeReview = function() {
        mcapi('/reviews/%', $scope.review.id)
            .success(function (data) {
                pubsub.send('open_reviews.change');
                $state.go('projects.overview.reviews');
            }).put({'status': 'close'});
    };

    $scope.reOpenReview = function() {
        mcapi('/reviews/%', $scope.review.id)
            .success(function (data) {
                pubsub.send('open_reviews.change');
                $state.go('projects.overview.reviews');
            }).put({'status': 'open'});
    };

    function init() {
        $scope.model = {
            selected: false,
            comment: ""
        };
        mcapi('/reviews/%', $stateParams.review_id)
            .success(function (data) {
                $scope.review = data;
            }).jsonp();
    }

    init();

}
