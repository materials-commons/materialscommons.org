Application.Controllers.controller('_indexNavigation',
    ["$scope", "User", "$state", "Nav",
        function ($scope, User, $state, Nav) {
            $scope.goHome = function () {
                if (User.isAuthenticated()) {
                    $state.go("toolbar.overview");
                } else {
                    $state.go("home");
                }
            };

            $scope.isActiveStep = function (nav) {
                return Nav.isActiveNav(nav);
            };

            $scope.showStep = function (step) {
                Nav.setActiveNav(step);
            };
        }]);