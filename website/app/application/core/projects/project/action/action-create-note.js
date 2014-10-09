Application.Directives.directive('actionCreateNote', actionCreateNote);

function actionCreateNote() {
    return {
        scope: {
            project: "="
        },
        controller: "actionCreateNoteController",
        restrict: "AE",
        templateUrl: "application/core/projects/project/action/action-create-note.html"
    };
}

Application.Controllers.controller('actionCreateNoteController',
                                   ["$scope", "User", "toastr","pubsub","actionStatus",
                                    "model.projects", "ui", actionCreateNoteController]);

function actionCreateNoteController($scope, User, toastr, pubsub, actionStatus, Projects, ui) {
    var state = actionStatus.getCurrentActionState($scope.project.id);
    if (state) {
        $scope.model = state;
    } else {
        $scope.model = {
            note: ""
        };
        actionStatus.setCurrentActionState($scope.project.id, $scope.model);
    }

    function saveNote() {
        $scope.project.put(User.keyparam()).then(function() {
            $scope.model.note = "";
            Projects.getList(true).then(function (projects) {
                Projects.get($scope.project.id).then(function (project) {
                    $scope.project = project;
                    pubsub.send('update-tab-count.change');
                    actionStatus.clearCurrentActionState($scope.project.id);
                    actionStatus.toggleCurrentAction($scope.project.id);
                    ui.setShowFiles($scope.project.id, true);
                    ui.setShowToolbarTabs($scope.project.id, true);
                });
            });
        }, function(reason){
            toastr.error(reason.data.error, 'Error', {
                closeButton: true
            });
        });
    }

    $scope.cancel = function() {
        actionStatus.clearCurrentActionState($scope.project.id);
        actionStatus.toggleCurrentAction($scope.project.id);
        ui.setShowFiles($scope.project.id, true);
        ui.setShowToolbarTabs($scope.project.id, true);
    };

    $scope.create = function () {
        $scope.project.notes.push({
            'message': $scope.model.note,
            'who': User.u(),
            'date': new Date()
        });
        saveNote();
    };
}
