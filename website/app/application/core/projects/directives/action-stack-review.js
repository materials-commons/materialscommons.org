Application.Directives.directive('actionReview', actionReviewDirective);

function actionReviewDirective() {
    return {
        scope: {},
        controller: "actionReviewController",
        restrict: "A",
        templateUrl: "application/core/projects/directives/action-stack-review.html"
    };
}

Application.Controllers.controller('actionReviewController',
    ["$scope", "mcapi", "$filter", "$state", "dateGenerate", "User","pubsub","$stateParams","model.Projects", "Projects", actionReviewController]);

function actionReviewController($scope, mcapi, $filter, $state, dateGenerate, User, pubsub,$stateParams, ListProjects, Projects) {
    $scope.review = {'items': [], 'messages': []};

    $scope.addReview = function () {
        //pluck the file items
        $scope.model.files.forEach(function(f){
            $scope.review.items.push({'id': f.id, 'path': f.fullname, 'name': f.name, 'type': f.type})
        })
        $scope.review.author = User.u();
        $scope.review.assigned_to = $scope.model.assigned_to;
        $scope.review.status = 'open';
        $scope.review.title = $scope.model.title;
        $scope.review.messages.push({'message': $scope.model.comment, 'who': User.u(), 'date': dateGenerate.new_date()});
        $scope.review.project = $scope.project_id
        $scope.saveData();
    };
    $scope.saveData = function () {
        mcapi('/reviews')
            .success(function (data) {
                $state.go('projects.overview.editreviews', {'review_id': data.id})
                $scope.model = {
                    comment: "",
                    assigned_to: "",
                    title: "",
                    files: []
                };
            }).post($scope.review);
    };

    $scope.removeFile = function (index) {
        $scope.model.files[index].selected = false;
        $scope.model.files.splice(index, 1);
    };
    $scope.indexOfFile = function (id) {
        for (var i = 0; i < $scope.model.files.length; i++) {
            if ($scope.model.files[i].id == id) {
                return i;
            }
        }
        return -1;
    };
    function init() {
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
            $scope.model.files.push(fileentry);
        } else {
            var i = $scope.indexOfFile(fileentry.id);
            if (i != -1) {
                $scope.model.files.splice(i, 1);
            }
        }
    });
}
