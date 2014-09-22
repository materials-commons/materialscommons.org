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
                                   ["$scope", "User", "toastr","pubsub","actionStatus", actionCreateNoteController]);

function actionCreateNoteController($scope, User, toastr, pubsub, actionStatus) {

    $scope.model = {
        note: ""
    };

    function saveNote() {
        $scope.project.put(User.keyparam()).then(function() {
            $scope.model.note = "";
            pubsub.send('update-tab-count.change');
            actionStatus.toggleAction($scope.project.id, 'create-note');
            //$scope.toggleStackAction('create-note', 'Create Note (c n)');
        }, function(reason){
            toastr.error(reason.data.error, 'Error', {
                closeButton: true
            });
        });
    }

    $scope.addNote = function () {
        $scope.project.notes.push({
            'message': $scope.model.note,
            'who': User.u(),
            'date': new Date()
        });
        saveNote();
    };
}
