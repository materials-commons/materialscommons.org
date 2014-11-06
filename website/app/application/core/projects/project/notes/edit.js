Application.Controllers.controller("projectNotesEdit",
    ["$scope", "project", "User", "$stateParams", "recent", "projectState", projectNotesEdit]);

function projectNotesEdit($scope, project, User, $stateParams, recent, projectState) {
    var stateID = $stateParams.sid;
    $scope.project = project;

    function saveNote() {
        $scope.project.notes[$scope.index] = $scope.model;
        project.put(User.keyparam()).then(function () {
            // nothing to do yet.
            recent.gotoLast($scope.project.id);
        });
    }

    $scope.updateNote = function () {
        saveNote();
        $scope.edit_index = -1;
    };

    $scope.cancel = function () {
        recent.delete($scope.project.id, stateID);
        projectState.delete($scope.project.id, stateID);
        recent.gotoLast($scope.project.id);
    };

    function init() {
        $scope.index = $stateParams.index;
        $scope.model = project.notes[$scope.index];
    }

    init();
}
