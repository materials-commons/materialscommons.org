Application.Controllers.controller("projectProvenance", ["$scope", "project", projectProvenance]);

function projectProvenance($scope, project) {
    $scope.projectID = project.id;
}
