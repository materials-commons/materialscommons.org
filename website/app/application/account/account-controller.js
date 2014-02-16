Application.Controllers.controller('account', ["$scope", "mcapi", "User", "alertService",
    function ($scope, mcapi, User, alertService) {
        $scope.new_password = undefined;
        $scope.verify_new_password = undefined;

        mcapi('/user/%', User.u())
            .success(function (data) {
                $scope.account = data;
            }).jsonp();

        $scope.saveChanges = function () {
            if ($scope.new_password) {
                if ($scope.new_password == $scope.verify_new_password) {
                    mcapi('/user/%/password/%', User.u(), $scope.new_password)
                        .success(function (data) {
                            $scope.msg = "Password updated successfully"
                        }).error(function (data) {
                            alertService.sendMessage(data.error);
                        }).put();
                } else {
                    $scope.msg = "Passwords do not match!"
                    alertService.sendMessage($scope.msg);
                }
            }
        }
    }]);