Application.Controllers.controller('account', ["$scope", "mcapi", "User", "Nav",
    function ($scope, mcapi, User, Nav) {
//
//        $scope.isActiveStep = function (nav) {
//            return Nav.isActiveNav(nav);
//        };
//
//        $scope.showStep = function (step) {
//            Nav.setActiveNav(step);
//        };

        $scope.init = function () {
            mcapi('/user/%', User.u())
                .success(function (data) {
                    $scope.account = data;
                }).jsonp();
        };

        $scope.init();
    }]);