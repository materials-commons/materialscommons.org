Application.Controllers.controller("projectNotes",
                                   ["$scope", "project", "projectState", "$state", projectNotes]);

function projectNotes($scope, project, projectState, $state) {
    $scope.projectID = project.id;

    $scope.createNote = function() {
        var state = null;
        var stateID = projectState.add(project.id, state);
        $state.go("projects.project.notes.create", {sid: stateID});
    };
}
