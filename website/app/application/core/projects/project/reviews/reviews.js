Application.Controllers.controller("projectReviews", ["$scope", "project", projectReviews]);

function projectReviews($scope, project) {
    $scope.projectID = project.id;
}
