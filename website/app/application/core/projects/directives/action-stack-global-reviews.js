Application.Directives.directive('actionGlobalReviews', actionReviewsDirective);

function actionReviewsDirective() {
    return {
        controller: "actionGlobalReviewsController",
        restrict: "A",
        templateUrl: "application/core/projects/directives/action-stack-global-reviews.html"
    };
}

Application.Controllers.controller('actionGlobalReviewsController',
    ["$scope", "mcapi", "$filter",  "pubsub", "User", "dateGenerate", "model.projects", actionGlobalReviewsController]);

function actionGlobalReviewsController($scope, mcapi, $filter,  pubsub, User, dateGenerate, Projects) {
    pubsub.waitOn($scope, 'update_reviews.change', function () {
        $scope.retrieveReviewsRequested();
        $scope.retrieveReviewsToConduct();
    });

    $scope.retrieveReviewsToConduct = function () {
        mcapi('/reviews/to_conduct')
            .success(function (reviews) {
                $scope.conduct_open_reviews = $filter('byKey')(reviews, 'status', 'open');
                $scope.conduct_closed_reviews = $filter('byKey')(reviews, 'status', 'close');
                $scope.reviewsToConduct = $scope.conduct_open_reviews;
                $scope.status = 'open';
            }).jsonp();
    };

    $scope.retrieveReviewsRequested = function () {
        mcapi('/reviews/requested')
            .success(function (reviews) {
                $scope.requested_open_reviews = $filter('byKey')(reviews, 'status', 'open');
                $scope.requested_closed_reviews = $filter('byKey')(reviews, 'status', 'close');
                $scope.reviewsRequested = $scope.requested_open_reviews;
                $scope.status = 'open';
            }).jsonp();
    };


    $scope.removeReview = function (index) {
        mcapi('/reviews/%', $scope.reviewsRequested[index].id)
            .success(function () {
                $scope.reviewsRequested.splice(index, 1);
                pubsub.send('reviews.change', 'review.change');
            }).delete();
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
                pubsub.send('reviews.change');
                $scope.retrieveReviewsRequested();
                $scope.retrieveReviewsToConduct();
                $scope.review = '';
                pubsub.send('update_reviews.change');
            }).put({'status': 'close'});
    };

    $scope.reOpenReview = function() {
        mcapi('/reviews/%', $scope.review.id)
            .success(function (data) {
                pubsub.send('reviews.change');
                $scope.retrieveReviewsRequested();
                $scope.retrieveReviewsToConduct();
                $scope.review = '';
                pubsub.send('update_reviews.change');
            }).put({'status': 'open'});
    };

    $scope.showReviews = function (status, type) {
        $scope.status = status;
        if (status == 'open') {
            if(type == 'requested'){
                $scope.reviewsRequested = $scope.requested_open_reviews;
            }else{
                $scope.reviewsToConduct = $scope.conduct_open_reviews;
            }

        }
        else if (status == 'close') {
            if(type == 'requested'){
                $scope.reviewsRequested = $scope.requested_closed_reviews;
            }else{
                $scope.reviewsToConduct = $scope.conduct_closed_reviews;

            }
        }
    };

    function init() {
        $scope.review = '';
        $scope.retrieveReviewsRequested();
        $scope.retrieveReviewsToConduct();
    }

    init();
}
