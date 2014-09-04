Application.Directives.directive('actionReview', actionReviewDirective);

function actionReviewDirective() {
    return {
        controller: "actionReviewController",
        restrict: "A",
        templateUrl: "application/core/projects/directives/action-stack-review.html"
    };
}

Application.Controllers.controller('actionReviewController',
    ["$scope", "mcapi", "$filter", "$state", "dateGenerate", "User","pubsub","$stateParams", actionReviewController]);

function actionReviewController($scope, mcapi, $filter, $state, dateGenerate, User, pubsub,$stateParams) {

    $scope.addReview = function () {
        $scope.review = {messages: []}
        $scope.review.item_id = $scope.project.id;
        $scope.review.item_type = 'datafile';
        $scope.review.item_name = $scope.project.name;
        $scope.review.author = User.u();
        $scope.review.assigned_to = $scope.model.assigned_to;
        $scope.review.status = 'open';
        $scope.review.title = $scope.model.title;
        $scope.review.messages.push({'message': $scope.model.new_review, 'who': User.u(), 'date': dateGenerate.new_date()});
        $scope.saveData();
    };
    $scope.saveData = function () {
        mcapi('/reviews')
            .success(function (data) {
                $state.go('projects.overview.editreviews', {'review_id': data.id})
                $scope.model.new_review = "";
            }).post($scope.review);
    };
    function init() {
        $scope.project_id = $stateParams.id;
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
