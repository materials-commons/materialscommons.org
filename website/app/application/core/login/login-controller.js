Application.Controllers.controller('login',
    ["$scope", "$state", "User", "alertService", "mcapi",
        function ($scope, $state, User, alertService, mcapi) {
            $scope.login = function () {
                mcapi('/user/%/%/apikey', $scope.email, $scope.password)
                    .success(function (apikey) {
                        User.setAuthenticated(true, apikey.apikey, $scope.email);
                        $scope.msg = "Logged in Successfully";
                        alertService.sendMessage($scope.msg);
                        $state.transitionTo('toolbar.overview');
                    })
                    .error(function (data) {
                        alertService.sendMessage(data.error);
                    }).jsonp();
            };

            $scope.cancel = function () {
                $state.transitionTo('home');
            };
        }]);
