Application.Controllers.controller('accountApikey',
    ["$scope", "mcapi", "User", "Nav", function ($scope, mcapi, User, Nav) {

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
            Nav.setActiveNav('apikey');
            $scope.showKey = false;
            $scope.showHideButton = "Show API Key";
            $scope.apikey = User.apikey();
        }

        init();

    }]);