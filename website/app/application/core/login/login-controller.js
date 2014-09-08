Application.Controllers.controller('login',
    ["$scope", "$state", "User", "alertService", "mcapi", "Nav", "pubsub", "model.projects", "Projects",
        function ($scope, $state, User, alertService, mcapi, Nav, pubsub, Projects, P2) {
            $scope.login = function () {
                mcapi('/user/%/apikey', $scope.email, $scope.password)
                    .success(function (u) {
                        User.setAuthenticated(true, u);
                        pubsub.send("tags.change");
                        Nav.setActiveNav('home');
                        Projects.clear();
                        P2.clear();
                        $state.transitionTo('projects');
                    })
                    .error(function (data) {
                        alertService.sendMessage(data.error);
                    }).put({password: $scope.password});
            };

            $scope.cancel = function () {
                $state.transitionTo('home');
            };
        }]);
