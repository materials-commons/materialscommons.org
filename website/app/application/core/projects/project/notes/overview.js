Application.Controllers.controller("projectNotesOverview",
    ["$scope", "project", "User", projectNotesOverview]);

function projectNotesOverview($scope, project, User) {
    function saveNote() {
        project.put(User.keyparam()).then(function(){
            // nothing to do yet.
        });
    }

    $scope.updateNote = function () {
        saveNote();
        $scope.edit_index = -1;
    };

    $scope.editNotes = function (index) {
        $scope.edit_index = index;
    };

    $scope.project = project;
    $scope.edit_index = -1;
}
