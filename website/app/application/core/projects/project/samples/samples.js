Application.Controllers.controller("projectSamples",
                                   ["$scope", "project", "projectState", "$state", projectSamples]);

function projectSamples($scope, project, projectState, $state) {
    $scope.projectID = project.id;

    $scope.createSample = function() {
        var state = null;
        var stateID = projectState.add(project.id, state);
        $state.go("projects.project.samples.create", {sid: stateID});
    };
}
