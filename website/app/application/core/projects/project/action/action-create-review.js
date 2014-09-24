Application.Directives.directive('actionCreateReview', actionCreateReview);

function actionCreateReview() {
    return {
        scope: {
            project: "="
        },
        controller: "actionCreateReviewController",
        restrict: "AE",
        templateUrl: "application/core/projects/project/action/action-create-review.html"
    };
}

Application.Controllers.controller('actionCreateReviewController',
                                   ["$scope", "mcapi", "User", "pubsub", "$stateParams",
                                    "model.projects", "projectFiles", "actionStatus",
                                    actionCreateReviewController]);

function actionCreateReviewController($scope, mcapi, User, pubsub, $stateParams, Projects,
                                      projectFiles, actionStatus) {
    $scope.channel = 'action-reviews';
    projectFiles.setChannel($scope.channel);

    Projects.getList().then(function(projects) {
        $scope.projects = projects;
    });

    initializeState();

    pubsub.waitOn($scope, $scope.channel, function (fileentry) {
        if (fileentry.selected) {
            $scope.model.files.push(fileentry);
        } else {
            var i = _.indexOf($scope.model.files, function(entry) {
                return entry.id == fileentry.id;
            });
            if (i != -1) {
                $scope.model.files.splice(i, 1);
            }
        }
    });

    function saveData() {
        mcapi('/reviews')
            .success(function (data) {
                Projects.getList(true).then(function (projects) {
                    Projects.get($scope.project.id).then(function (project) {
                        $scope.project = project;
                        pubsub.send('update-tab-count.change');
                        actionStatus.clearCurrentActionState($scope.project.id);
                        actionStatus.toggleAction($scope.project.id, 'create-review');
                    });

                });
            }).error(function (reason) {
            }).post($scope.review);
    }

    function initializeState() {
        var state = actionStatus.getCurrentActionState($scope.project.id);
        if (state) {
            $scope.model = state;
        } else {
            $scope.model = {
                comment: "",
                assigned_to: "",
                title: "",
                files: []
            };
            actionStatus.setCurrentActionState($scope.project.id, $scope.model);
        }

        $scope.review = {'items': [], 'messages': []};
    }

    $scope.cancel = function() {
        actionStatus.clearCurrentActionState($scope.project.id);
        actionStatus.toggleAction($scope.project.id, 'create-review');
    };

    $scope.create = function () {
        $scope.model.files.forEach(function (f) {
            $scope.review.items.push({
                'id': f.id,
                'path': f.fullname,
                'name': f.name,
                'type': f.type});
        });

        $scope.review.author = User.u();
        $scope.review.assigned_to = $scope.model.assigned_to;
        $scope.review.status = 'open';
        $scope.review.title = $scope.model.title;
        $scope.review.messages.push({
            'message': $scope.model.comment,
            'who': User.u(),
            'date': new Date()
        });
        $scope.review.project = $scope.project.id;
        saveData();
    };

    $scope.cancel = function() {
        actionStatus.clearCurrentActionState($scope.project.id);
        actionStatus.toggleAction($scope.project.id, 'create-review');
    };

    $scope.removeFile = function (index) {
        $scope.model.files[index].selected = false;
        $scope.model.files.splice(index, 1);
    };

}
