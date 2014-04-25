Application.Controllers.controller('login',
    ["$scope", "$state", "User", "alertService", "mcapi", "Nav", "pubsub",
        function ($scope, $state, User, alertService, mcapi, Nav, pubsub) {
            $scope.login = function () {
                mcapi('/user/%/apikey', $scope.email, $scope.password)
                    .success(function (apikey) {
                        User.setAuthenticated(true, apikey.apikey, $scope.email);
                        pubsub.send("tags.change");
                        Nav.setActiveNav('home');
                        $state.transitionTo('toolbar.overview');
                    })
                    .error(function (data) {
                        alertService.sendMessage(data.error);
                    }).put({password: $scope.password});
            };

            $scope.cancel = function () {
                $state.transitionTo('home');
            };
        }]);
