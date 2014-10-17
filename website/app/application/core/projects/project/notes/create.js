Application.Controllers.controller('projectNotesCreate',
                                   ["$scope", "User", "toastr","pubsub","actionStatus",
                                    "model.projects", projectNotesCreate]);

function projectNotesCreate($scope, User, toastr, pubsub, actionStatus, Projects) {
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
