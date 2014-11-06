Application.Controllers.controller('projectHome',
                                   ["$scope", "project", "User", "mcapi", projectHome]);

function projectHome($scope, project, User, mcapi) {
    $scope.updateName = function () {
        mcapi('/users/%', $scope.mcuser.email)
            .success(function (u) {
                $scope.editFullName = false;
                User.save($scope.mcuser);
            }).put({fullname: $scope.mcuser.fullname});
    };

    $scope.project = project;
    $scope.mcuser = User.attr();
}
