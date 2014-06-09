Application.Controllers.controller('accountPassword',
    ["$scope", "mcapi", "User", "alertService", function ($scope, mcapi, User, alertService) {
        $scope.changePassword = function () {
            if ($scope.new_password) {
                if ($scope.new_password === $scope.verify_new_password) {
                    mcapi('/user/%/password', User.u(), $scope.new_password)
                        .success(function () {
                            alertService.sendMessage("Password updated successfully");
                        }).error(function (data) {
                            alertService.sendMessage(data.error);
                        }).put({password: $scope.new_password});
                } else {
                    alertService.sendMessage("Passwords do not match.");
                }
            }
        };

        function init() {
            $scope.new_password = undefined;
            $scope.verify_new_password = undefined;

        }

        init();
    }]);