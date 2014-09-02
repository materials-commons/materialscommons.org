Application.Directives.directive('actionReviews', actionReviewsDirective);

function actionReviewsDirective() {
    return {
        controller: "actionReviewsController",
        restrict: "A",
        templateUrl: "application/core/projects/directives/action-stack-reviews.html"
    };
}

Application.Controllers.controller('actionReviewsController',
    ["$scope", "mcapi", "$filter", "$state", "dateGenerate", "User","pubsub","$stateParams", actionReviewsController]);

function actionReviewsController($scope, mcapi, $filter, $state, dateGenerate, User, pubsub,$stateParams) {
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
        $scope.review.messages.push({'message': $scope.model.comment, 'who': User.u(), 'date': dateGenerate.new_date()});
        mcapi('/reviews/%', $scope.review.id)
            .success(function (data) {
            }).put({'messages': $scope.review.messages});
    };

    $scope.closeReview = function() {
        mcapi('/reviews/%', $scope.review.id)
            .success(function (data) {
                pubsub.send('open_reviews.change');
                $scope.loadReviews($stateParams.id)
                $scope.review = ''
            }).put({'status': 'close'});
    };

    $scope.reOpenReview = function() {
        mcapi('/reviews/%', $scope.review.id)
            .success(function (data) {
                pubsub.send('open_reviews.change');
                $scope.loadReviews($stateParams.id)
                $scope.review = ''
            }).put({'status': 'open'});
    };

    $scope.viewReview = function (review) {
        $scope.model = {
            selected: false,
            comment: ""
        };
        mcapi('/reviews/%', review.id)
            .success(function (data) {
                $scope.review = data;
            }).jsonp();
    };

    $scope.showReviews = function (status) {
        $scope.status = status;
        if (status === 'open') {
            $scope.list_reviews = $scope.open_reviews;
        }
        else if (status === 'close') {
            $scope.list_reviews = $scope.closed_reviews;
        }
    };

    $scope.loadReviews = function (id) {
        mcapi('/project/%/reviews', id)
            .success(function (reviews) {
                $scope.open_reviews = $filter('reviewFilter')(reviews, 'open');
                $scope.closed_reviews = $filter('reviewFilter')(reviews, 'close');
                $scope.list_reviews = $scope.open_reviews;
                $scope.status = 'open';
            }).jsonp();

    };
    function init() {
        $scope.review = '';
        $scope.loadReviews($stateParams.id);
        $scope.status = 'open';
        mcapi('/projects/%', $stateParams.id)
            .success(function (data) {
                $scope.project = data;
            }).jsonp();
        $scope.model = {
            new_review: "",
            assigned_to: "",
            title: ""
        };
        mcapi('/selected_users')
            .success(function (data) {
                $scope.users = data;
            }).jsonp();
    }

    init();
}
