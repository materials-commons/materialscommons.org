Application.Controllers.controller('projectNotes',
    ["$scope", "project", projectNotes]);

function projectNotes($scope, project) {

    $scope.project = project;

}
