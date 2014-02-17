Application.Controllers.controller('account', ["$scope", "mcapi", "User", "alertService",
    function ($scope, mcapi, User, alertService) {

        $scope.init = function () {
            $scope.new_password = undefined;
            $scope.verify_new_password = undefined;
            $scope.showKey = false;
            $scope.showHideButton = "Show API Key";
            $scope.apikey = User.apikey();

            mcapi('/user/%', User.u())
                .success(function (data) {
                    $scope.account = data;
                }).jsonp();
        };

        $scope.changePassword = function () {
            if ($scope.new_password) {
                if ($scope.new_password == $scope.verify_new_password) {
                    mcapi('/user/%/password/%', User.u(), $scope.new_password)
                        .success(function () {
                            alertService.sendMessage("Password updated successfully");
                        }).error(function (data) {
                            alertService.sendMessage(data.error);
                        }).put();
                } else {
                    alertService.sendMessage("Passwords do not match.");
                }
            }
        };

        $scope.showApiKey = function () {
            $scope.showKey = !$scope.showKey;
            if (!$scope.showKey) {
                $scope.showHideButton = "Show API Key";
            } else {
                $scope.showHideButton = "Hide API Key";
            }
        };

        $scope.resetApikey = function () {
            mcapi('/user/%/apikey/reset', User.u())
                .success(function (data) {
                    var new_apikey = data;
                    User.reset_apikey(new_apikey['apikey']);
                }).error(function (data) {
                    alertService.sendMessage(data.error);
                }).put();
        }

        $scope.init();
    }]);