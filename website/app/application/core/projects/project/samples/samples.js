Application.Controllers.controller("projectSamples", ["$scope", "project", projectSamples]);

function projectSamples($scope, project) {
    $scope.projectID = project.id;
}
