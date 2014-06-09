Application.Controllers.controller('account', ["$scope", "mcapi", "User", "alertService",
    function ($scope, mcapi, User, alertService) {



        $scope.init = function () {

            mcapi('/user/%', User.u())
                .success(function (data) {
                    $scope.account = data;
                }).jsonp();
        };

        $scope.init();
    }]);