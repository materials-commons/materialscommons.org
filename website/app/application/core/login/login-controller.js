Application.Controllers.controller('login',
                                   ["$scope", "$state", "User", "toastr",
                                    "mcapi", "Nav", "pubsub", "model.projects",
                                    "projectFiles", loginController]);
function loginController($scope, $state, User, toastr, mcapi, Nav, pubsub, projects, projectFiles) {
    $scope.login = function () {
        mcapi('/user/%/apikey', $scope.email, $scope.password)
            .success(function (u) {
                User.setAuthenticated(true, u);
                pubsub.send("tags.change");
                Nav.setActiveNav('home');
                projects.clear();
                projectFiles.clear();
                projects.getList().then(function (projects) {
                    if (projects.length === 0) {
                        $state.go("projects.create");
                    } else {
                        $state.go('projects.project.home', {id: projects[0].id});
                    }
                });
            })
            .error(function (reason) {
                toastr.error(reason.error, 'Error', {
                    closeButton: true
                });
            }).put({password: $scope.password});
    };

    $scope.cancel = function () {
        $state.transitionTo('home');
    };
}
