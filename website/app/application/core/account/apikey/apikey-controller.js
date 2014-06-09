Application.Controllers.controller('accountApikey',
    ["$scope", "mcapi", "User", function ($scope, mcapi, User) {

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
                    User.reset_apikey(data.apikey);
                }).put();
        };

        function init() {
            $scope.showKey = false;
            $scope.showHideButton = "Show API Key";
            $scope.apikey = User.apikey();
        }

        init();

    }]);