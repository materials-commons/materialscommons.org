Application.Controllers.controller('toolbar',
    ["$scope", "Nav", function ($scope, Nav) {
        $scope.showDrafts = true;

        $scope.isActiveStep = function (nav) {
            return Nav.isActiveToolbar(nav);
        };

        $scope.showStep = function (step) {
            Nav.setActiveToolbar(step);
        };
    }]);









