Application.Controllers.controller("projectTasks",
    ["$scope", "project", "projectState", "$state", projectTasks]);

function projectTasks($scope, project, projectState, $state) {
    $scope.projectID = project.id;

    $scope.createTask = function() {
        var state = null;
        var stateID = projectState.add(project.id, state);
        $state.go("projects.project.tasks.create", {sid: stateID});
    };
}
