Application.Directives.directive('actionReview', actionReviewDirective);

function actionReviewDirective() {
    return {
        controller: "actionReviewController",
        restrict: "A",
        templateUrl: "application/core/projects/directives/action-stack-review.html"
    };
}

Application.Controllers.controller('actionReviewController',
    ["Projects", "$scope", "mcapi", "$filter", "$state", "dateGenerate", "User","pubsub","$stateParams","model.Projects",  actionReviewController]);

function actionReviewController(Projects, $scope, mcapi, $filter, $state, dateGenerate, User, pubsub,$stateParams, ListProjects) {

    $scope.addReview = function () {
//        $scope.review = {messages: []}
//        $scope.review.item_id = $scope.project.id;
//        $scope.review.item_type = 'datafile';
//        $scope.review.item_name = $scope.project.name;
//        $scope.review.author = User.u();
//        $scope.review.assigned_to = $scope.model.assigned_to;
//        $scope.review.status = 'open';
//        $scope.review.title = $scope.model.title;
//        $scope.review.messages.push({'message': $scope.model.new_review, 'who': User.u(), 'date': dateGenerate.new_date()});
//        $scope.saveData();
    };
    $scope.saveData = function () {
        mcapi('/reviews')
            .success(function (data) {
                $state.go('projects.overview.editreviews', {'review_id': data.id})
                $scope.model.new_review = "";
            }).post($scope.review);
    };

    function init() {
        $scope.files = []
        $scope.channel = 'action-reviews'
        Projects.setChannel($scope.channel);
        ListProjects.getList().then(function (data) {
            $scope.projects = data;
        });
        $scope.project_id = $stateParams.id;
        $scope.model = {
            comment: "",
            assigned_to: "",
            title: "",
            files: []
        };
        mcapi('/selected_users')
            .success(function (data) {
                $scope.users = data;
            }).jsonp();
    }

    init();

    pubsub.waitOn($scope, $scope.channel, function (fileentry) {
        if (fileentry.selected) {
            $scope.files.push(fileentry);
        } else {
            var i = $scope.indexOfFile(fileentry.id);
            if (i != -1) {
                $scope.files.splice(i, 1);
            }
        }
    });
}
