Application.Controllers.controller('projectNotesCreate',
                                   ["$scope", "User", "toastr", "projectState",
                                    "$stateParams", "project", "recent",
                                    projectNotesCreate]);

function projectNotesCreate($scope, User, toastr, projectState,
                            $stateParams, project, recent) {
    var projectID = project.id;
    var stateID = $stateParams.sid;

    var defaultModel = {
        note: "",
        title: ""
    };
    $scope.model = projectState.getset(projectID, stateID, defaultModel);

    function saveNote() {
        project.put(User.keyparam()).then(function(note) {
            recent.gotoLast(projectID);
        }, function(reason){
            toastr.error(reason.data.error, 'Error', {
                closeButton: true
            });
        });
    }

    $scope.cancel = function() {
        recent.delete(projectID, stateID);
        projectState.delete(projectID, stateID);
        recent.gotoLast(projectID);
    };

    $scope.create = function () {
        project.notes.push({
            'message': $scope.model.note,
            'who': User.u(),
            'date': new Date(),
            'title': $scope.model.title
        });
        saveNote();
    };
}
