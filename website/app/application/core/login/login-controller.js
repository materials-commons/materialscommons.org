Application.Controllers.controller('login',
    ["$scope", "$state", "User", "toastr", "mcapi", "Nav", "pubsub", "model.projects", "projectFiles",
        function ($scope, $state, User, toastr, mcapi, Nav, pubsub, projects, projectFiles) {
            $scope.login = function () {
                mcapi('/user/%/apikey', $scope.email, $scope.password)
                    .success(function (u) {
                        User.setAuthenticated(true, u);
                        pubsub.send("tags.change");
                        Nav.setActiveNav('home');
                        projects.clear();
                        projectFiles.clear();
                        projects.getList().then(function (projects) {
                            $state.go('projects.project.home', {id: projects[0].id});
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
        }]);
