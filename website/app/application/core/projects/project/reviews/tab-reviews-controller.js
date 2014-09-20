Application.Directives.directive('topShowReviews', actionShowReviewsDirective);

function actionShowReviewsDirective() {
    return {
        controller: "tabShowReviewsController",
        restrict: "A",
        templateUrl: "application/core/projects/project/reviews/reviews.html"
    };
}


Application.Controllers.controller('tabShowReviewsController',
    ["$scope", "mcapi", "$filter", "$state", "dateGenerate", "User",
        "pubsub","$stateParams", "model.projects", "projectColors", tabShowReviewsController]);

function tabShowReviewsController($scope, mcapi, $filter, $state, dateGenerate, User, pubsub, $stateParams, Projects, projectColors) {

    pubsub.waitOn($scope, 'update-review-items.change', function () {
        $scope.loadProjectReviews($stateParams.id, true);
        if ($scope.review.id){
            $scope.viewReview($scope.review);
        }
    });

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
            .success(function () {
                $scope.loadProjectReviews($stateParams.id, true);
                $scope.review = '';
                pubsub.send('update-open-reviews.change');
            }).put({'status': 'close'});
    };

    $scope.reOpenReview = function() {
        mcapi('/reviews/%', $scope.review.id)
            .success(function () {
                $scope.loadProjectReviews($stateParams.id, true);
                $scope.review = '';
                pubsub.send('update-open-reviews.change');
            }).put({'status': 'open'});
    };

    $scope.loadProjectReviews = function (id, reload) {
        Projects.getList(reload).then(function (projects) {
            Projects.get($stateParams.id).then(function (project) {
                $scope.project = project;
                $scope.reviewCount($scope.project);

            });
        });
    };

    $scope.showReviewsperStatus = function (status) {
        $scope.status = status;
    };


    $scope.reviewCount = function(project){
        $scope.open_reviews = $filter('byKey')(project.reviews, 'status', 'open');
        $scope.closed_reviews = $filter('byKey')(project.reviews, 'status', 'close');
    }

    function init() {
        $scope.review = '';
        $scope.status = 'open';
        $scope.color = projectColors.getCurrentProjectColor();
        Projects.get($stateParams.id).then(function(project) {
            $scope.project = project;
            $scope.reviewCount(project);
        });

        $scope.model = {
            new_review: "",
            assigned_to: "",
            title: ""
        };

    }
    init();
}
