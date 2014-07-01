Application.Controllers.controller('account', ["$scope", "mcapi", "User",
    function ($scope, mcapi, User) {
        $scope.init = function () {
            mcapi('/user/%', User.u())
                .success(function (data) {
                    $scope.account = data;
                }).jsonp();
        };

        $scope.init();
    }]);