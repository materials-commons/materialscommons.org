Application.Controllers.controller('projectHome',
                                   ["$scope", "project", "User", projectHome]);

function projectHome($scope, project, User) {
    $scope.user = User.u();
    $scope.project = project;
}
